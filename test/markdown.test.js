'use strict';

const test = require('node:test');
const assert = require('node:assert');

// markdown.js is a plain script that attaches to window; give it one.
globalThis.window = globalThis;
require('../chrome/src/lib/markdown.js');
const C2M = globalThis.ChatToMarkdown;

const { h, text } = require('./mini-dom');

test('paragraph with inline styles', () => {
  const p = h('p', {},
    'Hello ', h('strong', {}, 'world'), ' and ', h('em', {}, 'emphasis'),
    ' with ', h('code', {}, 'x=1'));
  assert.equal(C2M.domToMarkdown(p), 'Hello **world** and *emphasis* with `x=1`');
});

test('headings', () => {
  const d = h('div', {}, h('h2', {}, 'Design'), h('p', {}, 'Body text.'));
  assert.equal(C2M.domToMarkdown(d), '## Design\n\nBody text.');
});

test('unordered list', () => {
  const ul = h('ul', {}, h('li', {}, 'alpha'), h('li', {}, 'beta ', h('strong', {}, 'bold')));
  assert.equal(C2M.domToMarkdown(ul), '- alpha\n- beta **bold**');
});

test('ordered list with nested unordered', () => {
  const ol = h('ol', {},
    h('li', {}, 'First step', h('ul', {}, h('li', {}, 'sub a'), h('li', {}, 'sub b'))),
    h('li', {}, 'Second'));
  assert.equal(
    C2M.domToMarkdown(ol),
    '1. First step\n  - sub a\n  - sub b\n2. Second'
  );
});

test('fenced code block with language', () => {
  const pre = h('pre', {},
    h('code', { class: 'language-elixir' }, 'def x do\n  :ok\nend'));
  assert.equal(
    C2M.domToMarkdown(h('div', {}, pre)),
    '```elixir\ndef x do\n  :ok\nend\n```'
  );
});

test('code block ignores nested copy buttons', () => {
  const pre = h('pre', {},
    h('button', {}, 'Copy code'),
    h('code', { class: 'language-js' }, 'let x = 1;'));
  assert.equal(C2M.domToMarkdown(pre), '```js\nlet x = 1;\n```');
});

test('gfm table with pipe escaping', () => {
  const table = h('table', {},
    h('thead', {}, h('tr', {}, h('th', {}, 'Name'), h('th', {}, 'A|B'))),
    h('tbody', {}, h('tr', {}, h('td', {}, 'alpha'), h('td', {}, 'gamma'))));
  assert.equal(
    C2M.domToMarkdown(table),
    '| Name | A\\|B |\n| --- | --- |\n| alpha | gamma |'
  );
});

test('blockquote', () => {
  const q = h('blockquote', {}, h('p', {}, 'line one'), h('p', {}, 'line two'));
  assert.equal(C2M.domToMarkdown(q), '> line one\n>\n> line two');
});

test('links', () => {
  const p = h('p', {}, 'See ', h('a', { href: 'https://anthropic.com' }, 'Anthropic'));
  assert.equal(C2M.domToMarkdown(p), 'See [Anthropic](https://anthropic.com)');
});

test('katex becomes inline math', () => {
  const k = h('span', { class: 'katex' },
    h('span', { class: 'katex-mathml' },
      h('annotation', { encoding: 'application/x-tex' }, 'E = mc^2')));
  assert.equal(C2M.domToMarkdown(h('p', {}, k)), '$E = mc^2$');
});

test('plain text container (user turn)', () => {
  const d = h('div', {}, text('summarize this'));
  assert.equal(C2M.domToMarkdown(d), 'summarize this');
});

test('escapes leading list marker in a paragraph', () => {
  assert.equal(C2M.domToMarkdown(h('p', {}, '- not a list')), '\\- not a list');
});

test('assistant-shaped container end to end', () => {
  const md = h('div', { class: 'markdown' },
    h('p', {}, 'Use ', h('code', {}, 'Enum.reduce'), ' like this:'),
    h('pre', {}, h('code', { class: 'language-elixir' }, 'Enum.reduce(1..3, 0, &+/2)')),
    h('p', {}, 'That sums ', h('strong', {}, 'everything'), '.'));
  assert.equal(
    C2M.domToMarkdown(md),
    'Use `Enum.reduce` like this:\n\n```elixir\nEnum.reduce(1..3, 0, &+/2)\n```\n\nThat sums **everything**.'
  );
});

test('skips sr-only and aria-hidden nodes', () => {
  const d = h('div', {},
    h('span', { class: 'sr-only' }, 'Claude responded:'),
    h('p', {}, 'Real answer'),
    h('p', { 'aria-hidden': 'true' }, 'decorative'));
  assert.equal(C2M.domToMarkdown(d), 'Real answer');
});
