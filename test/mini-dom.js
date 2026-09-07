'use strict';

/*
 * Zero-dependency mini-DOM for testing the converter under node.
 * Implements exactly the surface markdown.js touches: nodeType, tagName,
 * childNodes, children, textContent, getAttribute.
 */

class MiniNode {}

class MiniText extends MiniNode {
  constructor(text) {
    super();
    this.nodeType = 3;
    this._text = String(text);
  }
  get textContent() { return this._text; }
}

class MiniElement extends MiniNode {
  constructor(tag, attrs) {
    super();
    this.nodeType = 1;
    this.tagName = String(tag).toUpperCase();
    this._attrs = attrs || {};
    this.childNodes = [];
  }
  getAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this._attrs, name)
      ? this._attrs[name]
      : null;
  }
  get children() {
    return this.childNodes.filter(function (n) { return n.nodeType === 1; });
  }
  get textContent() {
    return this.childNodes.map(function (n) { return n.textContent; }).join('');
  }
  append(child) {
    this.childNodes.push(child);
    return child;
  }
}

function h(tag, attrs, ...kids) {
  const e = new MiniElement(tag, attrs);
  for (const k of kids.flat(Infinity)) {
    if (k === null || k === undefined) continue;
    e.append(typeof k === 'object' ? k : new MiniText(k));
  }
  return e;
}

function text(t) { return new MiniText(t); }

module.exports = { MiniElement, MiniText, h, text };
