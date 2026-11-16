#!/usr/bin/env node
/**
 * 索引生成と整合性検査。
 *
 *   使い方: node tools/build-index.mjs
 *   出力:   dist/index.md（Git 管理外。手で編集しない）
 *
 * 中央インデックスを持たないための生成器。各ファイルの front-matter を読む。
 * 検査: ID重複 / 参照切れ / 必須項目 / strength の範囲。
 * エラーがあれば終了コード 1。
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const AXES = ['tempo', 'intensity', 'motion', 'reward', 'audio', 'copy', 'flow', 'style', 'restraint', 'backlash'];
const KINDS = ['site', 'screenshot', 'video', 'code', 'text'];
const RIGHTS = ['third-party', 'own', 'cc'];

const read = (p) => readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
const toPosix = (p) => p.split('\\').join('/');
const relPath = (p) => toPosix(p).replace(toPosix(ROOT) + '/', '');

/* ---------- 簡易 YAML（key: value / key: [a, b] のみ） ---------- */

function unquote(s) {
  if (s.length >= 2) {
    if (s[0] === '"' && s.at(-1) === '"') return s.slice(1, -1).replace(/\\"/g, '"');
    if (s[0] === "'" && s.at(-1) === "'") return s.slice(1, -1).replace(/''/g, "'");
  }
  return s;
}

function parseFlatYaml(text) {
  const data = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):[ \t]*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const v = m[2].trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      data[key] = v
        .slice(1, -1)
        .split(',')
        .map((s) => unquote(s.trim()))
        .filter((s) => s !== '');
    } else {
      data[key] = unquote(v);
    }
  }
  return data;
}

function splitFrontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/);
  if (!m) return null;
  return { data: parseFlatYaml(m[1]), body: text.slice(m[0].length) };
}

const firstHeading = (body) => {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : '';
};

const asArray = (v) => (Array.isArray(v) ? v : v ? [String(v)] : []);
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

/* ---------- 収集 ---------- */

const items = [];
const itemsDir = join(ROOT, 'corpus', 'items');
if (existsSync(itemsDir)) {
  for (const e of readdirSync(itemsDir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith('_')) continue;
    const metaPath = join(itemsDir, e.name, 'meta.yml');
    if (!existsSync(metaPath)) {
      err(`corpus/items/${e.name}/meta.yml が無い（素材は meta.yml 必須）`);
      continue;
    }
    const data = parseFlatYaml(read(metaPath));
    if (!data.id) err(`corpus/items/${e.name}/meta.yml に id が無い`);
    else if (data.id !== e.name) err(`meta.yml の id "${data.id}" がディレクトリ名 "${e.name}" と一致しない`);
    if (data.kind && !KINDS.includes(data.kind)) warn(`corpus/items/${e.name}: kind "${data.kind}" は想定外（${KINDS.join('/')}）`);
    if (data.rights && !RIGHTS.includes(data.rights)) warn(`corpus/items/${e.name}: rights "${data.rights}" は想定外（${RIGHTS.join('/')}）`);
    for (const a of asArray(data.axes)) if (!AXES.includes(a)) warn(`corpus/items/${e.name}: 未知の軸 "${a}"`);
    const priv = join(ROOT, 'corpus', 'private', e.name);
    for (const m of asArray(data.media)) {
      if (!existsSync(join(priv, m))) warn(`corpus/private/${e.name}/${m} が無い（同期前・未配置の可能性）`);
    }
    items.push({ id: data.id || e.name, dir: e.name, data });
  }
}

function scanDocs(dirName, prefix) {
  const out = [];
  const abs = join(ROOT, dirName);
  if (!existsSync(abs)) return out;
  const re = new RegExp(`^${prefix}-`);
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    if (!e.isFile() || !e.name.endsWith('.md') || !re.test(e.name)) continue;
    const file = `${dirName}/${e.name}`;
    const text = read(join(abs, e.name));
    const fm = splitFrontMatter(text);
    const stem = e.name.replace(/\.md$/, '');
    if (!fm) {
      err(`${file}: front matter（--- ... ---）が無い`);
      continue;
    }
    const id = fm.data.id || stem;
    if (fm.data.id && fm.data.id !== stem) warn(`${file}: id "${fm.data.id}" とファイル名が一致しない`);
    for (const a of asArray(fm.data.axes)) if (!AXES.includes(a)) warn(`${file}: 未知の軸 "${a}"`);
    out.push({ id, file, data: fm.data, title: firstHeading(fm.body) });
  }
  return out;
}

const observations = scanDocs('observations', 'O');
const patterns = scanDocs('patterns', 'P');
const rules = scanDocs('rules', 'R');

/* ---------- 検査 ---------- */

const registry = new Map();
const register = (id, where) => {
  if (!id) return;
  if (registry.has(id)) err(`ID 重複: "${id}"（${registry.get(id)} と ${where}）`);
  else registry.set(id, where);
};
for (const it of items) register(it.id, `corpus/items/${it.dir}/meta.yml`);
for (const o of observations) register(o.id, o.file);
for (const p of patterns) register(p.id, p.file);
for (const r of rules) register(r.id, r.file);

const exists = (id) => registry.has(id);
const knownRef = (id) => exists(id) || id.startsWith('EXT-') || id.startsWith('H');

for (const o of observations) {
  const refs = asArray(o.data.corpus);
  if (refs.length === 0) warn(`${o.file}: corpus が空（どの素材を見たか書く）`);
  for (const c of refs) if (!exists(c)) err(`${o.file}: corpus "${c}" が corpus/items/ に無い`);
  if (!o.data.date) warn(`${o.file}: date が無い`);
}

for (const p of patterns) {
  const ev = asArray(p.data.evidence);
  if (ev.length < 3) warn(`${p.file}: evidence が${ev.length}件（傾向は観察3件以上で立てる）`);
  for (const e of ev) if (!knownRef(e)) err(`${p.file}: evidence "${e}" が存在しない`);
}

const validStrength = (v) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 5;

for (const r of rules) {
  const ev = asArray(r.data.evidence);
  if (!r.data.domain) err(`${r.file}: domain が無い`);
  else if (!AXES.includes(r.data.domain)) warn(`${r.file}: 未知の domain "${r.data.domain}"`);
  if (r.data.strength === undefined || r.data.strength === '') err(`${r.file}: strength が無い`);
  else if (!validStrength(r.data.strength)) err(`${r.file}: strength "${r.data.strength}" は 1〜5 の整数でない`);
  if (ev.length === 0) warn(`${r.file}: evidence が空（根拠IDを書く）`);
  for (const e of ev) if (!knownRef(e)) err(`${r.file}: evidence "${e}" が存在しない`);
}

/* ---------- 出力 ---------- */

const sortById = (a, b) => a.id.localeCompare(b.id, 'en');
const tableHead = (cols) => `| ${cols.join(' | ')} |\n|${cols.map(() => '---').join('|')}|`;

const lines = [];
lines.push('# 索引（生成物）');
lines.push('');
lines.push('> `node tools/build-index.mjs` が生成する。**手で編集しない**（[ADR 0001](../docs/04-decisions/0001-no-central-index.md)）。');
lines.push(`> 生成日: ${new Date().toISOString().slice(0, 10)}`);
lines.push('');
const adopted = rules.filter((r) => r.data.status === 'adopted').length;
lines.push(
  `素材 **${items.length}** / 観察 **${observations.length}** / 傾向 **${patterns.length}** / 規則 **${rules.length}**（adopted: ${adopted}）`
);
lines.push('');

lines.push('## 素材');
lines.push('');
if (items.length === 0) {
  lines.push('_まだ無い。[corpus/README.md](../corpus/README.md) の手順で1件目を足す。_');
} else {
  lines.push(tableHead(['ID', 'タイトル', '種類', '軸', '出典']));
  for (const it of [...items].sort(sortById)) {
    const d = it.data;
    lines.push(
      `| [${cell(it.id)}](../corpus/items/${cell(it.dir)}/meta.yml) | ${cell(d.title)} | ${cell(d.kind)} | ${cell(asArray(d.axes).join(' '))} | ${cell(d.source)} |`
    );
  }
}
lines.push('');

lines.push('## 観察');
lines.push('');
if (observations.length === 0) {
  lines.push('_まだ無い。[observations/_TEMPLATE.md](../observations/_TEMPLATE.md) をコピーして書く。_');
} else {
  lines.push(tableHead(['ID', 'date', 'corpus', '軸', 'confidence', 'status']));
  for (const o of [...observations].sort(sortById)) {
    const d = o.data;
    lines.push(
      `| [${cell(o.id)}](../${cell(o.file)}) | ${cell(d.date)} | ${cell(asArray(d.corpus).join(' '))} | ${cell(asArray(d.axes).join(' '))} | ${cell(d.confidence)} | ${cell(d.status)} |`
    );
  }
}
lines.push('');

lines.push('## 傾向');
lines.push('');
if (patterns.length === 0) {
  lines.push('_まだ無い。観察3件以上が同じ徴候を指したら立てる。_');
} else {
  lines.push(tableHead(['ID', '傾向', '軸', '根拠', 'status']));
  for (const p of [...patterns].sort(sortById)) {
    const d = p.data;
    lines.push(
      `| [${cell(p.id)}](../${cell(p.file)}) | ${cell(p.title)} | ${cell(asArray(d.axes).join(' '))} | ${asArray(d.evidence).length}件 | ${cell(d.status)} |`
    );
  }
}
lines.push('');

lines.push('## 規則');
lines.push('');
if (rules.length === 0) {
  lines.push('_まだ無い。傾向を実装可能な指示に翻訳して追加する。_');
} else {
  lines.push(tableHead(['ID', 'domain', '強度', 'status', '根拠']));
  for (const r of [...rules].sort(sortById)) {
    const d = r.data;
    lines.push(
      `| [${cell(r.id)}](../${cell(r.file)}) | ${cell(d.domain)} | ${cell(d.strength)} | ${cell(d.status)} | ${cell(asArray(d.evidence).join(' '))} |`
    );
  }
}
lines.push('');

lines.push('## 検査結果');
lines.push('');
if (errors.length === 0 && warnings.length === 0) {
  lines.push('- エラー 0 / 警告 0');
} else {
  if (errors.length) {
    lines.push(`### エラー ${errors.length}（修正するまで commit しない）`);
    lines.push('');
    for (const e of errors) lines.push(`- ${e}`);
    lines.push('');
  }
  if (warnings.length) {
    lines.push(`### 警告 ${warnings.length}`);
    lines.push('');
    for (const w of warnings) lines.push(`- ${w}`);
    lines.push('');
  }
}

const outDir = join(ROOT, 'dist');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'index.md');
writeFileSync(outFile, lines.join('\n') + '\n', 'utf8');

/* ---------- レポート ---------- */

console.log(
  `素材 ${items.length} / 観察 ${observations.length} / 傾向 ${patterns.length} / 規則 ${rules.length}`
);
console.log(`書き出し: ${relPath(outFile)}`);
for (const w of warnings) console.warn(`WARN  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);
if (errors.length) {
  console.error(`\nエラー ${errors.length} 件。修正してから commit する。`);
  process.exit(1);
}
console.log('OK（エラー 0）');
