'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { build, OUT } = require('../marketing/build-skills');

test('agent skills have valid frontmatter and skills.json is up to date', () => {
  const fresh = build();
  assert.ok(fresh.skills.length >= 7);
  for (const s of fresh.skills) {
    assert.match(s.name, /^[a-z0-9-]+$/);
    assert.ok(s.description.length > 50 && s.description.length <= 1024, s.name);
  }
  const saved = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  assert.deepStrictEqual(saved, fresh, 'run: node marketing/build-skills.js');
});

test('files referenced by skills exist', () => {
  const root = path.join(__dirname, '..');
  for (const s of build().skills) {
    const refs = s.text.match(/`((?:marketing|docs|onchain|deploy|launches|src)\/[\w./-]+)`/g) || [];
    for (const r of refs) {
      const p = r.slice(1, -1);
      assert.ok(fs.existsSync(path.join(root, p)), `${s.name} references missing ${p}`);
    }
  }
});
