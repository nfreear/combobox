const { fetch, HTMLElement } = globalThis;

/**
 * A custom element for an editable combobox, with list autocomplete.
 *
 * @customElement my-combobox
 * @license MIT
 */
export default class MyComboboxElement extends HTMLElement {
  #iconCssUrl = 'https://cdn.jsdelivr.net/gh/SebastianAigner/twemoji-amazing/twemoji-amazing.css';
  #iconPrefix = 'twa twa-flag-';
  #resp;
  #optionData;
  #optionElems = [];
  #currentIndex;
  #popoverOpen = false;

  get value () { return this.#input.value.trim(); }

  /* Private getters.
  */
  get #src () { return this.getAttribute('src'); }
  get #loadIconStyle () { return this.hasAttribute('load-icon-style'); }
  get #noResult () { return this.getAttribute('noresult') ?? 'No results found'; }
  get #inputError () { return this.getAttribute('input-error') ?? 'Error. Unexpected input'; }

  /* Accessibility: enforce ARIA roles and other attributes!
  */
  get #input () { return this.shadowRoot.querySelector('input[role = combobox]'); }
  get #popover () { return this.shadowRoot.querySelector('[popover]'); }
  get #listbox () { return this.shadowRoot.querySelector('ul[role = listbox]'); }
  get #output () { return this.shadowRoot.querySelector('output, [aria-live]'); }
  get #button () { return this.shadowRoot.querySelector('button[command *= toggle]'); }

  constructor () {
    super();
    this.#expectations();
    this.#fetchCreateOptions();
    if (this.#loadIconStyle) {
      this.#appendIconStyleElement();
    }

    this.#input.addEventListener('input', (ev) => this.#onInput(ev));
    this.#input.addEventListener('keyup', (ev) => this.#onKeyUp(ev));
    this.#input.addEventListener('command', (ev) => this.#onCommand(ev));
    this.#popover.addEventListener('toggle', (ev) => this.#onToggle(ev));
  }

  #expectations () {
    console.assert(this.shadowRoot, 'Missing declarative shadow DOM');
    console.assert(this.#input, 'Missing input');
    console.assert(this.#listbox, 'Missing listbox');
    console.assert(this.#popover, 'Missing popover');
    console.assert(this.#output, 'Missing output');
    console.assert(this.#button, 'Missing toggle button');
  }

  async #fetchCreateOptions () {
    this.#resp = await fetch(this.#src);
    this.dataset.httpStatus = this.#resp.status;
    console.assert(this.#resp.ok, `Fetch error: ${this.#resp.status}`);
    const data = await this.#resp.json();
    console.assert(Array.isArray(data.options) && data.options.length, 'Missing option data');
    this.#optionData = data.options;

    this.#createOptionElements();
    console.debug('my-combobox:', this.#optionElems.length, [this]);
  }

  #createOptionElements () {
    this.#optionData.forEach((entry, idx) => {
      const { label, value } = entry;
      const listItem = document.createElement('li');
      const button = document.createElement('button');
      const textNode = document.createTextNode(label || value); // ??
      const iconElem = this.#createIconElement(entry);
      button.role = 'option';
      button.id = `OPT_${idx}`;
      button.value = value || label; // ??
      button.command = '--set-value';
      button.setAttribute('commandfor', this.#input.id);
      button.setAttribute('tabindex', -1);
      button.appendChild(iconElem);
      button.appendChild(textNode);
      listItem.role = 'none';
      listItem.appendChild(button);
      this.#listbox.appendChild(listItem);
      this.#optionElems.push(button);
    });
    this.dataset.total = this.#optionElems.length;
  }

  #createIconElement (entry) {
    const { label, value, icon, iconId } = entry;
    const iconElem = document.createElement('ico');
    const theIconId = (iconId || value || label).replace(/ /g, '-').toLowerCase();
    iconElem.className = `${this.#iconPrefix}${theIconId}`;
    iconElem.dataset.icon = icon;
    iconElem.setAttribute('part', 'icon');
    iconElem.setAttribute('aria-hidden', 'true');
    return iconElem;
  }

  #appendIconStyleElement () {
    const styleElem = document.createElement('link');
    styleElem.setAttribute('rel', 'stylesheet');
    styleElem.href = this.#iconCssUrl;
    this.shadowRoot.appendChild(styleElem);
    console.debug('styleElem:', styleElem);
    return styleElem;
  }

  #resetHidden () {
    this.#optionElems.forEach((el) => { el.parentElement.removeAttribute('hidden'); });
    this.#listbox.removeAttribute('hidden');
  }

  #resetSelected () {
    this.#optionElems.forEach((el) => { el.removeAttribute('aria-selected'); });
  }

  #togglePopover (force) { this.#popover.togglePopover({ force, source: this.#input }); }

  #updateStatus (message = '') { this.#output.value = message; }

  #find (option, query) {
    const found = option.value.toLowerCase().includes(query.trim().toLowerCase());
    if (!found) { option.parentElement.setAttribute('hidden', ''); }
    return found ? 1 : 0;
  }

  #setOptionByIndex (idx = 0) {
    console.assert(typeof idx === 'number' && idx >= 0, 'Unexpected index');
    const prevOption = this.#optionElems[this.#currentIndex];
    const newOption = this.#optionElems[idx];
    if (prevOption) {
      prevOption.classList.remove('rovingFocus');
    }
    if (newOption) {
      newOption.classList.add('rovingFocus');
      this.#currentIndex = idx;
      this.#input.setAttribute('aria-activedescendant', newOption.id);
    }
  }

  #setOptionByOffset (offset) {
    console.assert(typeof offset === 'number', 'Unexpected offset');
    const prevOption = this.#optionElems[this.#currentIndex];
    const newOption = this.#optionElems[this.#currentIndex + offset];
    if (newOption) {
      prevOption.classList.remove('rovingFocus');
      newOption.classList.add('rovingFocus');
      this.#currentIndex += offset;
      this.#input.setAttribute('aria-activedescendant', newOption.id);
      console.debug('offset:', offset);
    }
  }

  /*
   * Event handlers.
   */

  #onKeyUp (event) {
    const { key } = event;
    if (/Arrow(Up|Down)/.test(key)) {
      if (this.#popoverOpen) {
        const offset = (key === 'ArrowUp') ? -1 : 1;
        this.#setOptionByOffset(offset);
      } else {
        this.#setOptionByIndex(0);
        this.#togglePopover(true);
      }
      console.debug('keyup:', key, [this], event);
    }
  }

  #onInput (event) {
    let count = 0;

    if (!this.#input.checkValidity()) {
      return this.#setError(this.#inputError);
    }

    if (this.value.length) {
      this.#togglePopover(true);
      this.#resetHidden();
      this.#optionElems.forEach((el) => { count += this.#find(el, this.value); });

      this.dataset.count = count;
      this.#updateStatus(count <= 0 ? this.#noResult : ''); // `${count} results`);
    } else {
      this.#clearInput();
    }

    console.debug('input:', count, this.value, event);
  }

  #onToggle (event) {
    const isOpen = this.#popoverOpen = event.newState === 'open';
    this.#input.setAttribute('aria-expanded', isOpen);
    this.#button.setAttribute('aria-expanded', isOpen); // Purely for CSS?!
    if (isOpen) {
      this.#input.focus();
    }
    console.debug('toggle:', event.newState, event);
  }

  #onCommand (event) {
    const { command, source, target } = event;
    const { value } = source;

    switch (command) {
      case '--set-value':
        this.#input.value = value;
        // this.#input.setAttribute('aria-activedescendant', source.id);
        this.#resetSelected();
        source.setAttribute('aria-selected', true);
        this.#togglePopover(false);
        break;
      case '--clear':
        this.#clearInput();
        break;
      default:
        throw new Error(`Unrecognised command: ${command}`);
    }
    console.debug('command:', command, value, source, target, event);
  }

  #clearInput () {
    this.#input.value = '';
    this.#input.setAttribute('aria-activedescendant', '');
    this.removeAttribute('data-error');
    this.#resetHidden();
    this.#resetSelected();
    this.#updateStatus();
  }

  #setError (message) {
    this.dataset.error = message;
    this.#updateStatus(message);
    this.#listbox.setAttribute('hidden', '');
    this.#togglePopover(true);
    console.error(message);
  }
}
