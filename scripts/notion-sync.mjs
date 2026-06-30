#!/usr/bin/env node
/**
 * Notion → Hugo 글 자동 동기화 (PRD-16)
 *
 * Notion 데이터베이스의 각 페이지를 Hugo 페이지 번들
 * (content/posts/{섹션}/{slug}/index.md + 동봉 이미지)로 변환한다.
 *
 * 사용법:
 *   cp .env.example .env   # NOTION_TOKEN, NOTION_DB_ID 입력
 *   npm install
 *   make sync              # 또는 node scripts/notion-sync.mjs [--prune] [--all]
 *
 * 옵션:
 *   --all     상태=작성중 글도 draft:true 로 함께 변환 (기본은 발행 글만)
 *   --prune   Notion 에서 사라진 글의 로컬 번들을 삭제
 *   --force   매니페스트 무시하고 전체 재변환
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content", "posts");
const MAP_PATH = path.join(ROOT, "data", "notion-map.json");
const MANIFEST_PATH = path.join(ROOT, "data", "notion-sync.json");

const ARGS = new Set(process.argv.slice(2));
const OPT_ALL = ARGS.has("--all");
const OPT_PRUNE = ARGS.has("--prune");
const OPT_FORCE = ARGS.has("--force");

// notion-to-md 가 기본 지원하는 블록 타입 (리포트용 화이트리스트)
const SUPPORTED_BLOCKS = new Set([
  "paragraph", "heading_1", "heading_2", "heading_3", "heading_4",
  "bulleted_list_item", "numbered_list_item", "to_do", "toggle",
  "code", "quote", "callout", "divider", "image", "table", "table_row",
  "bookmark", "embed", "video", "file", "pdf", "equation",
  "column", "column_list", "link_to_page", "child_page", "synced_block",
]);

// ── 유틸 ───────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  }
  const { NOTION_TOKEN, NOTION_DB_ID } = process.env;
  if (!NOTION_TOKEN || !NOTION_DB_ID) {
    console.error("✗ NOTION_TOKEN / NOTION_DB_ID 가 필요합니다. .env 를 확인하세요 (.env.example 참고).");
    process.exit(1);
  }
  return { token: NOTION_TOKEN, dbId: NOTION_DB_ID };
}

function readJSON(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch { return fallback; }
}

const slugify = (s) =>
  String(s).trim().toLowerCase()
    .replace(/[\s/]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "post";

// Notion 속성 추출 (속성명 별칭 허용)
const pickProp = (props, names) => {
  for (const n of names) if (props[n]) return props[n];
  return null;
};
const readTitle = (p) => p?.title?.map((t) => t.plain_text).join("") ?? "";
const readText = (p) => p?.rich_text?.map((t) => t.plain_text).join("") ?? "";
const readSelect = (p) => p?.select?.name ?? "";
const readMulti = (p) => p?.multi_select?.map((t) => t.name) ?? [];
const readDate = (p) => p?.date?.start ?? "";
const readNumber = (p) => (typeof p?.number === "number" ? p.number : null);
const readCheckbox = (p) => (typeof p?.checkbox === "boolean" ? p.checkbox : null);
const readFiles = (p) =>
  (p?.files ?? []).map((f) => (f.type === "external" ? f.external.url : f.file?.url)).filter(Boolean);

// YAML front matter 안전 직렬화 (JSON 스칼라는 유효한 YAML)
const y = (v) => JSON.stringify(v);

async function downloadImage(url, bundleDir, seed) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`이미지 다운로드 실패 ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  let ext = (new URL(url).pathname.match(/\.(png|jpe?g|gif|webp|svg)$/i)?.[1] || "").toLowerCase();
  if (!ext) {
    const ct = res.headers.get("content-type") || "";
    ext = ct.includes("png") ? "png" : ct.includes("gif") ? "gif"
      : ct.includes("webp") ? "webp" : ct.includes("svg") ? "svg" : "jpg";
  }
  if (ext === "jpeg") ext = "jpg";
  const name = `img-${crypto.createHash("sha1").update(seed).digest("hex").slice(0, 10)}.${ext}`;
  fs.mkdirSync(bundleDir, { recursive: true });
  fs.writeFileSync(path.join(bundleDir, name), buf);
  return name;
}

// 블록 타입을 재귀로 수집 (미지원 블록 리포트용)
async function collectBlockTypes(notion, blockId, acc, depth = 0) {
  if (depth > 6) return;
  let cursor;
  do {
    const r = await notion.blocks.children.list({ block_id: blockId, start_cursor: cursor, page_size: 100 });
    for (const b of r.results) {
      acc.add(b.type);
      if (b.has_children) await collectBlockTypes(notion, b.id, acc, depth + 1);
    }
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
}

// ── 메인 ───────────────────────────────────────────────

async function main() {
  const { token, dbId } = loadEnv();
  const notion = new Client({ auth: token });
  const n2m = new NotionToMarkdown({ notionClient: notion, config: { parseChildPages: false } });

  const mapCfg = readJSON(MAP_PATH, { map: {} }).map || {};
  const manifest = OPT_FORCE ? {} : readJSON(MANIFEST_PATH, {});
  const nextManifest = { ...manifest };

  // 이미지 다운로드용: 현재 처리 중인 번들 디렉터리 (커스텀 트랜스포머가 참조)
  let currentBundle = null;
  let imageCount = 0;
  n2m.setCustomTransformer("image", async (block) => {
    const img = block.image;
    const url = img.type === "external" ? img.external.url : img.file.url;
    const caption = (img.caption ?? []).map((c) => c.plain_text).join("");
    try {
      const name = await downloadImage(url, currentBundle, block.id);
      imageCount++;
      return `![${caption}](${name})`;
    } catch (e) {
      report.imageErrors.push(`${currentSlug}: ${e.message}`);
      return `![${caption}](${url})`; // 실패 시 원본 URL 유지 (조용한 손실 방지)
    }
  });

  // DB 전체 페이지 수집
  const pages = [];
  let cursor;
  do {
    const r = await notion.databases.query({ database_id: dbId, start_cursor: cursor, page_size: 100 });
    pages.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);

  const report = { synced: [], skipped: [], unsupported: {}, imageErrors: [], errors: [] };
  // Notion H4 (notion-to-md 가 기본 변환하지 않아 본문에서 누락됨 → 직접 변환)
  n2m.setCustomTransformer("heading_4", (block) => {
    const text = (block.heading_4?.rich_text ?? []).map((t) => t.plain_text).join("");
    return `#### ${text}`;
  });

  let currentSlug = "";
  const seenIds = new Set();

  for (const page of pages) {
    const props = page.properties;
    const title = readTitle(pickProp(props, ["제목", "Name", "Title", "이름"]));
    if (!title) continue;

    // 발행 여부: 체크박스(완료 여부) 우선, 없으면 Select(상태) 폴백, 둘 다 없으면 발행으로 간주
    const doneCheck = readCheckbox(pickProp(props, ["완료", "완료 여부", "완료여부", "발행", "Done", "Published", "Complete", "Publish"]));
    let isPublished;
    if (doneCheck !== null) {
      isPublished = doneCheck;
    } else {
      const statusVal = readSelect(pickProp(props, ["상태", "Status"]));
      isPublished = statusVal === "발행" || statusVal === "Published" || statusVal === "";
    }
    if (!isPublished && !OPT_ALL) { report.skipped.push(`${title} (작성중)`); continue; }

    // 카테고리: select 또는 multi_select(예: 종류) 지원.
    // 매핑되는 첫 값을 섹션으로 쓰고, 매핑 안 되는 나머지 값은 태그로 흡수.
    const catProp = pickProp(props, ["카테고리", "Category", "종류", "분류"]);
    const catValues = catProp?.type === "multi_select"
      ? readMulti(catProp)
      : (catProp?.select?.name ? [catProp.select.name] : []);
    let mapped = null;
    const extraTags = [];
    for (const v of catValues) {
      if (!mapped && mapCfg[v]) mapped = mapCfg[v];
      else extraTags.push(v);
    }
    if (!catValues.length) {
      report.skipped.push(`${title} (카테고리 미지정)`);
      continue;
    }
    if (!mapped) {
      report.errors.push(`매핑 없는 카테고리 [${catValues.join(", ")}] → ${title} (data/notion-map.json 에 추가 필요)`);
      continue;
    }

    const slug = slugify(readText(pickProp(props, ["슬러그", "Slug"])) || title);
    currentSlug = slug;
    seenIds.add(page.id);

    const relDir = path.join("content", "posts", mapped.section, slug);
    const bundleDir = path.join(ROOT, relDir);

    // 증분: last_edited_time 비교
    const prev = manifest[page.id];
    if (!OPT_FORCE && prev && prev.lastEdited === page.last_edited_time && fs.existsSync(path.join(bundleDir, "index.md"))) {
      report.skipped.push(`${title} (변경 없음)`);
      nextManifest[page.id] = prev;
      continue;
    }

    // slug 변경 시 기존 번들 정리
    if (prev && prev.path && prev.path !== relDir) {
      const old = path.join(ROOT, prev.path);
      if (fs.existsSync(old)) fs.rmSync(old, { recursive: true, force: true });
    }

    // 미지원 블록 리포트 수집
    try {
      const types = new Set();
      await collectBlockTypes(notion, page.id, types);
      for (const t of types) if (!SUPPORTED_BLOCKS.has(t)) {
        (report.unsupported[t] ??= []).push(title);
      }
    } catch { /* 리포트 실패는 변환을 막지 않음 */ }

    // 섹션 list 페이지(_index.md) 보장 — 없으면 사이드바에서 숨겨지고 링크가 404
    const sectionIndex = path.join(ROOT, "content", "posts", mapped.section, "_index.md");
    if (!fs.existsSync(sectionIndex)) {
      fs.mkdirSync(path.dirname(sectionIndex), { recursive: true });
      fs.writeFileSync(sectionIndex, `---\ntitle: ${y(mapped.category)}\n---\n`);
    }

    // 본문 변환 (이미지 트랜스포머가 currentBundle 에 다운로드)
    currentBundle = bundleDir;
    fs.mkdirSync(bundleDir, { recursive: true });
    const mdblocks = await n2m.pageToMarkdown(page.id);
    const body = n2m.toMarkdownString(mdblocks).parent || "";

    // 대표 이미지
    const cover = readFiles(pickProp(props, ["대표이미지", "Cover", "이미지", "Image"]));
    let coverName = "";
    if (cover[0]) {
      try { coverName = await downloadImage(cover[0], bundleDir, page.id + ":cover"); imageCount++; }
      catch (e) { report.imageErrors.push(`${slug} cover: ${e.message}`); }
    }

    // front matter
    const date = readDate(pickProp(props, ["발행일", "Date", "날짜"])) || page.created_time.slice(0, 10);
    const tags = [...new Set([...extraTags, ...readMulti(pickProp(props, ["태그", "Tags"]))])];
    const description = readText(pickProp(props, ["요약", "Description", "설명"]));
    const series = readText(pickProp(props, ["시리즈", "Series"]));
    const seriesOrder = readNumber(pickProp(props, ["순서", "Order", "SeriesOrder"]));
    const draft = !isPublished;

    const fm = [
      "---",
      `title: ${y(title)}`,
      `date: ${y(date.slice(0, 10))}`,
      `draft: ${draft}`,
      `categories: [${y(mapped.category)}]`,
      `tags: [${tags.map(y).join(", ")}]`,
      `description: ${y(description)}`,
      `image: ${y(coverName)}`,
    ];
    if (series) fm.push(`series: [${y(series)}]`);
    if (seriesOrder != null) fm.push(`series_order: ${seriesOrder}`);
    fm.push(`notionID: ${y(page.id)}`);
    fm.push(`notionEdited: ${y(page.last_edited_time)}`);
    fm.push("---", "");

    fs.writeFileSync(path.join(bundleDir, "index.md"), fm.join("\n") + body + "\n");
    nextManifest[page.id] = { path: relDir, slug, lastEdited: page.last_edited_time };
    report.synced.push(`${mapped.section}/${slug}`);
  }

  // prune: Notion 에서 사라진 글
  for (const id of Object.keys(manifest)) {
    if (seenIds.has(id)) continue;
    const entry = manifest[id];
    if (OPT_PRUNE) {
      const dir = path.join(ROOT, entry.path);
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
      delete nextManifest[id];
      report.synced.push(`(삭제) ${entry.path}`);
    } else {
      report.skipped.push(`${entry.path} (Notion 에 없음 — --prune 으로 삭제 가능)`);
      nextManifest[id] = entry;
    }
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(nextManifest, null, 2) + "\n");

  // ── 리포트 ──
  console.log("\n━━━━━━ Notion 동기화 리포트 ━━━━━━");
  console.log(`✓ 변환/갱신: ${report.synced.length}`);
  report.synced.forEach((s) => console.log(`   + ${s}`));
  console.log(`· 건너뜀: ${report.skipped.length}`);
  console.log(`🖼  이미지 다운로드: ${imageCount}`);
  const unsup = Object.keys(report.unsupported);
  if (unsup.length) {
    console.log(`⚠ 미지원/검토 필요 블록 타입: ${unsup.length}`);
    unsup.forEach((t) => console.log(`   ! ${t} → ${[...new Set(report.unsupported[t])].join(", ")}`));
  }
  if (report.imageErrors.length) {
    console.log(`⚠ 이미지 오류 ${report.imageErrors.length}:`);
    report.imageErrors.forEach((e) => console.log(`   ! ${e}`));
  }
  if (report.errors.length) {
    console.log(`✗ 오류 ${report.errors.length}:`);
    report.errors.forEach((e) => console.log(`   ! ${e}`));
    process.exitCode = 1;
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
