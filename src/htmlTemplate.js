const { DOMParser } = globalThis;
const { resolve } = import.meta;

export const defaultOptions = {
  clear: 'Clear',
  listbox: 'Options',
  toggle: 'Toggle options',
  stylesheet: resolve('../assets/my-combobox.css'),
  emojiStylesheet: 'https://cdn.jsdelivr.net/gh/SebastianAigner/twemoji-amazing/twemoji-amazing.css'
};

export function htmlTemplate (options = {}) {
  const OPT = { ...defaultOptions, ...options };
  const { clear, listbox, toggle, stylesheet, emojiStylesheet } = OPT;
  console.debug('template data:', OPT);
  return `
<template>
  <link rel="stylesheet" href="${stylesheet}">
  <link rel="stylesheet" href="${emojiStylesheet}">
  <span class="row">
    <slot></slot>
    <input id="input" role="combobox" aria-describedby="status" aria-controls="list" aria-haspopup="listbox" aria-autocomplete="list" aria-expanded="false">
    <button commandfor="input" command="--clear" aria-label="${clear}"></button>
    <button commandfor="popover" command="toggle-popover" aria-label="${toggle}" tabindex="-1"></button>
  </span>
  <div id="popover" popover>
    <output id="status"><!-- Live region, initially empty --></output>
    <ul id="list" role="listbox" aria-label="${listbox}"></ul>
  </div>
</template>
`;
}

/**
 * A fluent utility to attach a HTML template to an element.
 * @copyright © Nick Freear, 05-July-2025.
 * @example attachTemplate(templateHtml).to.shadowDOM(this)
 * @see https://github.com/nfreear/elements
 */
export function attachTemplate (templateHtml, templateOptions = {}) {
  console.assert(templateHtml, 'templateHtml - required');
  const parser = new DOMParser();
  const result = typeof templateHtml === 'function' ? templateHtml(templateOptions) : templateHtml;
  const doc = parser.parseFromString(result, 'text/html');

  const template = doc.querySelector('template');
  if (!template) {
    throw new Error('Missing <template> element. Can\'t clone node.');
  }
  const docFragment = template.content.cloneNode(true);

  return {
    to: {
      shadowDOM: (element) => {
        return element.attachShadow({ mode: 'open' }).appendChild(docFragment);
      },
      element: (element) => {
        return element.appendChild(docFragment);
      }
    }
  };
}
