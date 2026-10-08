#!/usr/bin/env node
'use strict';
// Bundles .claude/skills/*/SKILL.md into marketing/data/skills.json for the guide page's Skills tab.
// Run after editing a skill: node marketing/build-skills.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, '.claude', 'skills');
const OUT = path.join(__dirname, 'data', 'skills.json');
const ORDER = ['bundlepad', 'user-intake', 'content-autopilot', 'social-posting', 'market-research', 'script-engine', 'video-sourcing', 'bundlepad-launch'];

function parse(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error('missing frontmatter');
  const meta = Object.fromEntries(m[1].split('\n').map((l) => l.match(/^(\w+):\s*(.*)$/)).filter(Boolean).map((x) => [x[1], x[2]]));
  return { meta, body: text.slice(m[0].length) };
}

function build() {
  const names = fs.readdirSync(DIR).filter((n) => fs.existsSync(path.join(DIR, n, 'SKILL.md')));
  names.sort((a, b) => ((ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99)) || a.localeCompare(b));
  return {
    repo: 'https://github.com/thegoodolbois/Bundlepad',
    raw: 'https://raw.githubusercontent.com/thegoodolbois/Bundlepad/main/.claude/skills/',
    skills: names.map((dir) => {
      const text = fs.readFileSync(path.join(DIR, dir, 'SKILL.md'), 'utf8');
      const { meta } = parse(text);
      if (meta.name !== dir) throw new Error(`${dir}: frontmatter name is "${meta.name}"`);
      if (!meta.description) throw new Error(`${dir}: no description`);
      return { name: meta.name, description: meta.description, path: `.claude/skills/${dir}/SKILL.md`, text };
    }),
  };
}

if (require.main === module) {
  fs.writeFileSync(OUT, JSON.stringify(build(), null, 1) + '\n');
  console.log(`wrote ${path.relative(ROOT, OUT)}`);
}
module.exports = { build, parse, OUT };
