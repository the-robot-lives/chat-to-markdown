/*
 * chat-to-markdown — DOM → Markdown converter.
 *
 * Adapters hand over {role, element} turns; this module knows nothing about
 * sites. It touches only a minimal DOM surface (nodeType, tagName, childNodes,
 * children, textContent, getAttribute) so it runs in the browser and under the
 * zero-dep mini-DOM in test/.
 */
(function () {
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const C2M = (ROOT.ChatToMarkdown = ROOT.ChatToMarkdown || {});

  const BLOCK_TAGS = new Set([
    'P', 'DIV', 'SECTION', 'ARTICLE', 'UL', 'OL', 'LI', 'PRE', 'TABLE',
    'THEAD', 'TBODY', 'TFOOT', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5',
    'H6', 'HR', 'DL', 'DT', 'DD', 'FIGURE', 'FIGCAPTION', 'MAIN', 'NAV',
    'ASIDE', 'HEADER', 'FOOTER'
  ]);

  function tagName(n) { return n.nodeType === 1 ? n.tagName : null; }
  function getAttr(n, name) {
    return n.nodeType === 1 ? (n.getAttribute(name) || '') : '';
  }
  function hasClass(n, name) {
    return (' ' + getAttr(n, 'class') + ' ').indexOf(' ' + name + ' ') !== -1;
  }

  // screen-reader-only / decorative nodes never belong in an export
  function isHidden(n) {
    return n.nodeType === 1 &&
      (getAttr(n, 'aria-hidden') === 'true' ||
       /(^|\s)(sr-only|cdk-visually-hidden|visually-hidden)(\s|$)/.test(getAttr(n, 'class')));
  }

  function findAll(node, tag) {
    const out = [];
    (function walk(n) {
      const kids = n.nodeType === 1 ? n.childNodes : [];
      for (const c of kids) {
        if (c.nodeType === 1 && c.tagName === tag) out.push(c);
        walk(c);
      }
    })(node);
    return out;
  }

  // textContent, skipping UI chrome (copy buttons, styles) that sites nest
  // inside content containers.
  function textExcluding(node, skip) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return '';
    if (skip.indexOf(node.tagName) !== -1) return '';
    let s = '';
    for (const c of node.childNodes) s += textExcluding(c, skip);
    return s;
  }

  // ---------------------------------------------------------------- inline

  function bold(s) { s = s.trim(); return s ? '**' + s + '**' : ''; }
  function italic(s) { s = s.trim(); return s ? '*' + s + '*' : ''; }

  function codeSpan(s) {
    s = String(s).replace(/\n/g, ' ');
    if (!s) return '';
    if (s.indexOf('`') === -1) return '`' + s + '`';
    if (s.indexOf('``') === -1) return '``' + s + '``';
    return '` ' + s + ' `'; // degenerate fallback
  }

  function katexTex(node) {
    const ann = findAll(node, 'ANNOTATION').find(function (a) {
      return getAttr(a, 'encoding').indexOf('x-tex') !== -1;
    });
    return ann ? ann.textContent.trim() : node.textContent.trim();
  }

  function inlineMd(node) {
    if (node.nodeType === 3) return node.textContent.replace(/[ \t\r\n]+/g, ' ');
    if (node.nodeType !== 1) return '';
    if (isHidden(node)) return '';

    if (hasClass(node, 'katex')) return '$' + katexTex(node) + '$';

    const inner = function () {
      let s = '';
      for (const c of node.childNodes) s += inlineMd(c);
      return s;
    };

    switch (node.tagName) {
      case 'STRONG': case 'B': return bold(inner());
      case 'EM': case 'I': return italic(inner());
      case 'DEL': case 'S': return '~~' + inner().replace(/^ +| +$/g, '') + '~~';
      case 'CODE': return codeSpan(textExcluding(node, ['BUTTON']));
      case 'A': {
        const href = getAttr(node, 'href');
        const t = inner().trim();
        return href ? '[' + t + '](' + href + ')' : t;
      }
      case 'BR': return '\n';
      case 'BUTTON': case 'STYLE': case 'SCRIPT': return '';
      default: return inner();
    }
  }

  function inlineAll(el) {
    let s = '';
    for (const c of el.childNodes) s += inlineMd(c);
    return s.replace(/ {2,}/g, ' ');
  }

  // ---------------------------------------------------------------- blocks

  function hasBlockChild(el) {
    for (const c of el.children) {
      if (BLOCK_TAGS.has(c.tagName)) return true;
    }
    return false;
  }

  function paraMd(el) {
    let s = inlineAll(el).replace(/ *\n */g, '\n').trim();
    // escape leading markdown constructs so prose stays prose
    // ('1.' escapes the period — backslash-before-digit isn't a valid md escape)
    s = s.replace(/^(\s{0,3})(#{1,6}\s|[-*+]\s|>\s|(\d+)\.\s)/, function (m, sp, construct, num) {
      if (num !== undefined) return sp + num + '\\. ';
      return sp + '\\' + construct.charAt(0) + construct.slice(1);
    });
    return s;
  }

  function containerMd(el) {
    const parts = [];
    for (const c of el.childNodes) {
      const m = blockMd(c);
      if (m && m.trim()) parts.push(m.trim());
    }
    return parts.join('\n\n');
  }

  function listMd(listEl, depth) {
    const ordered = listEl.tagName === 'OL';
    let idx = parseInt(getAttr(listEl, 'start') || '1', 10) || 1;
    const out = [];
    for (const li of listEl.children) {
      if (li.tagName !== 'LI') continue;
      const nested = [];
      const inlineNodes = [];
      for (const c of li.childNodes) {
        if (c.nodeType === 1 && (c.tagName === 'UL' || c.tagName === 'OL')) nested.push(c);
        else inlineNodes.push(c);
      }
      let head = '';
      for (const n of inlineNodes) head += inlineMd(n);
      head = head.replace(/ {2,}/g, ' ').trim();
      out.push('  '.repeat(depth) + (ordered ? idx + '.' : '-') + ' ' + head);
      for (const nl of nested) out.push(listMd(nl, depth + 1));
      idx++;
    }
    return out.join('\n');
  }

  function codeBlockMd(preEl) {
    const codeEl = findAll(preEl, 'CODE')[0] || preEl;
    const m = getAttr(codeEl, 'class').match(/language-([\w#+.-]+)/);
    let code = textExcluding(codeEl, ['BUTTON', 'STYLE', 'SCRIPT']);
    code = code.replace(/^\n+|\n+$/g, '');
    const fence = code.indexOf('```') !== -1 ? '````' : '```';
    return fence + (m ? m[1] : '') + '\n' + code + '\n' + fence;
  }

  function tableMd(tableEl) {
    const rows = findAll(tableEl, 'TR');
    if (!rows.length) return '';
    const cellsOf = function (row) {
      return Array.prototype.filter.call(row.children, function (c) {
        return c.tagName === 'TD' || c.tagName === 'TH';
      }).map(function (c) {
        const s = inlineAll(c)
          .replace(/\|/g, '\\|')
          .replace(/\n/g, ' ')
          .trim();
        return s || ' ';
      });
    };
    const line = function (cells) { return '| ' + cells.join(' | ') + ' |'; };
    const header = cellsOf(rows[0]);
    const out = [line(header), line(header.map(function () { return '---'; }))];
    for (const r of rows.slice(1)) out.push(line(cellsOf(r)));
    return out.join('\n');
  }

  function blockMd(node) {
    if (node.nodeType === 3) {
      const t = node.textContent.trim();
      return t || '';
    }
    if (node.nodeType !== 1) return '';
    if (isHidden(node)) return '';

    switch (node.tagName) {
      case 'H1': case 'H2': case 'H3': case 'H4': case 'H5': case 'H6': {
        const t = inlineAll(node).trim();
        return t ? '#'.repeat(+node.tagName[1]) + ' ' + t : '';
      }
      case 'P': case 'DT': case 'DD':
        return paraMd(node);
      case 'UL': case 'OL':
        return listMd(node, 0);
      case 'PRE':
        return codeBlockMd(node);
      case 'BLOCKQUOTE': {
        const innerMd = hasBlockChild(node) ? containerMd(node) : paraMd(node);
        return innerMd.split('\n').map(function (l) { return l ? '> ' + l : '>'; }).join('\n');
      }
      case 'TABLE':
        return tableMd(node);
      case 'HR':
        return '---';
      case 'BUTTON': case 'STYLE': case 'SCRIPT': case 'NAV':
        return '';
      default:
        if (hasBlockChild(node)) return containerMd(node);
        return paraMd(node);
    }
  }

  // ------------------------------------------------------------------ api

  function domToMarkdown(el) {
    if (!el) return '';
    // Render the element itself when it carries block meaning (p, ul, pre, …);
    // blockMd falls through to containerMd for plain wrapper divs.
    return (blockMd(el) || '').replace(/\n{3,}/g, '\n\n').trim();
  }

  C2M.domToMarkdown = domToMarkdown;
})();
