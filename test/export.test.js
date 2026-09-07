'use strict';

const test = require('node:test');
const assert = require('node:assert');

// Both libs are plain scripts that attach to window; give them one.
globalThis.window = globalThis;
require('../chrome/src/lib/markdown.js');
require('../chrome/src/lib/export.js');
const C2M = globalThis.ChatToMarkdown;
const { h } = require('./mini-dom');

// capture the real converter before tests stub it
const realDomToMarkdown = C2M.domToMarkdown;

const META = {
  title: 'My Chat',
  source: 'chatgpt.com',
  url: 'https://chatgpt.com/x',
  date: '2026-09-07'
};

test('buildDocument: front matter, roles, * * * separators', () => {
  C2M.domToMarkdown = function () { return 'BODY'; };
  const turns = [
    { role: 'user', element: null },
    { role: 'assistant', element: null }
  ];
  const md = C2M.export.buildDocument(META, turns);
  assert.ok(md.startsWith('---\n'));
  assert.ok(md.includes('title: "My Chat"'));
  assert.ok(md.includes('source: chatgpt.com'));
  assert.ok(md.includes('url: https://chatgpt.com/x'));
  assert.ok(md.includes('exported: 2026-09-07'));
  assert.ok(md.includes('# My Chat'));
  assert.ok(md.includes('## User'));
  assert.ok(md.includes('## Assistant'));
  assert.equal(md.split('* * *').length - 1, 1, 'one separator between two turns');
  assert.ok(md.endsWith('\n'));
});

test('buildDocument: no separator after the last turn', () => {
  C2M.domToMarkdown = function () { return 'BODY'; };
  const md = C2M.export.buildDocument(META, [{ role: 'user', element: null }]);
  assert.equal(md.split('* * *').length - 1, 0);
});

test('buildYaml: api-format messages with tool entries', () => {
  C2M.domToMarkdown = function () { return 'BODY'; };
  const turns = [
    { role: 'user', element: h('div', {}), tools: [] },
    {
      role: 'assistant',
      element: h('div', {}),
      tools: [{ name: 'web search', status: 'ok', bytes: 4200 }]
    }
  ];
  const y = C2M.export.buildYaml(META, turns);
  assert.ok(y.includes('title: "My Chat"'));
  assert.ok(y.includes('messages:'));
  assert.ok(y.includes('  - role: user'));
  assert.ok(y.includes('  - role: assistant'));
  assert.ok(y.includes('  - role: tool'));
  assert.ok(y.includes('    name: "web search"'));
  assert.ok(y.includes('tool-call-response: ok response 4.1 kB'));
  assert.ok(y.includes('    content: |-'));
  assert.ok(y.includes('      BODY'));
  assert.ok(
    y.indexOf('- role: assistant') < y.indexOf('- role: tool'),
    'tool message follows the assistant message it belongs to'
  );
  assert.ok(y.endsWith('\n'));
});

test('buildYaml: empty thread is an empty messages list', () => {
  C2M.domToMarkdown = function () { return 'BODY'; };
  const y = C2M.export.buildYaml(META, []);
  assert.ok(y.includes('messages:'));
  assert.ok(y.includes('  []'));
});

test('buildFilename slugifies and dates', () => {
  const name = C2M.export.buildFilename('My Chat: "Great Ideas"!!', new Date(2026, 8, 7));
  assert.equal(name, 'my-chat-great-ideas-2026-09-07.md');
});

test('buildFilename falls back to "chat"', () => {
  const name = C2M.export.buildFilename('???', new Date(2026, 8, 7));
  assert.equal(name, 'chat-2026-09-07.md');
});

test('tool-call placeholder lines survive unescaped', () => {
  const d = h('div', {},
    h('p', {}, 'tool-call made to web search'),
    h('p', {}, 'tool-call-response: ok response 4.1 kB'));
  assert.equal(
    realDomToMarkdown(d),
    'tool-call made to web search\n\ntool-call-response: ok response 4.1 kB'
  );
});
