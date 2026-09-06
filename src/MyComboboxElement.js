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
  #visibleOpt = [];
  #currentIndex = 0;
  #popoverOpen = false;

  /* Public setters/getters.
  */
  set options (optionsArray) {
    console.assert(Array.isArray(optionsArray) && optionsArray.length, 'Invalid options array');
    this.#optionData = optionsArray;
    this.#createOptionElements();
  }

  get options () { return this.#optionData; }
  get value () { return this.#input.value.trim(); }

  /* Private getters.
  */
  get #src () { return this.getAttribute('src'); }
  get #noResult () { return this.getAttribute('noresult') ?? 'No results found'; }
  get #inputError () { return this.getAttribute('input-error') ?? 'Error. Unexpected input'; }

  /* Accessibility: enforce ARIA roles and other attributes!
  */
  get #input () { return this.shadowRoot.querySelector('input[role = combobox]'); }
  get #popover () { return this.shadowRoot.querySelector('[popover]'); }
  get #listbox () { return this.#popover.querySelector('ul[role = listbox]'); }
  get #output () { return this.shadowRoot.querySelector('output, [aria-live]'); }
  get #button () { return this.shadowRoot.querySelector('button[command *= toggle]'); }

  constructor () {
    super();
    this.#expectations();
    if (this.#src) {
      this.#fetchCreateOptions();
    }

    this.#input.addEventListener('input', (ev) => this.#onInput(ev));
    this.#input.addEventListener('keyup', (ev) => this.#onKeyUp(ev));
    this.#input.addEventListener('command', (ev) => this.#onCommand(ev));
    this.#popover.addEventListener('toggle', (ev) => this.#onToggle(ev));
  }

  #expectations () {
    console.assert(this.shadowRoot, 'Missing declarative shadow DOM');
    console.assert(this.#input, 'Missing input');
    console.assert(this.#popover, 'Missing popover');
    console.assert(this.#listbox, 'Missing listbox');
    console.assert(this.#output, 'Missing output');
    console.assert(this.#button, 'Missing toggle button');
  }

  #reselectVisibleOptions () {
    this.#visibleOpt = this.#listbox.querySelectorAll(':not([hidden]) [role = option]');
  }

  // Deprecated?!
  async #fetchCreateOptions () {
    console.assert(this.#src, 'Missing src');
    this.#resp = await fetch(this.#src);
    this.dataset.httpStatus = this.#resp.status;
    console.assert(this.#resp.ok, `Fetch error: ${this.#resp.status}`);
    const data = await this.#resp.json();
    const options = Array.isArray(data) ? data : data.options;
    console.assert(Array.isArray(options) && options.length, 'Missing option data');
    this.#optionData = options;

    this.#createOptionElements();
  }

  #createOptionElements () {
    this.#optionData.forEach((entry, idx) => {
      const { name, value } = entry;
      const listItem = document.createElement('li');
      const button = document.createElement('button');
      const textNode = document.createTextNode(name || value); // ??
      const iconElem = this.#createIconElement(entry);
      button.role = 'option';
      button.id = `OPT_${idx}`;
      button.value = value || name; // ??
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
    this.#reselectVisibleOptions();
    this.dataset.total = this.#optionElems.length;
    console.debug('my-combobox:', this.#optionElems.length, [this]);
  }

  #createIconElement (entry) {
    const { name, value, emoji, iconId } = entry;
    const iconElem = document.createElement('ico');
    const theIconId = (iconId || value || name).replace(/ /g, '-').toLowerCase();
    iconElem.className = `${this.#iconPrefix}${theIconId}`;
    iconElem.dataset.emoji = emoji;
    iconElem.setAttribute('part', 'icon');
    iconElem.setAttribute('aria-hidden', 'true');
    return iconElem;
  }

  #resetHidden () {
    this.#optionElems.forEach((el) => { el.parentElement.removeAttribute('hidden'); });
    this.#listbox.removeAttribute('hidden');
  }

  #resetSelected () {
    this.#optionElems.forEach((el) => { el.removeAttribute('aria-selected'); });
  }

  #resetRovingFocus () {
    this.#optionElems.forEach((el) => { el.classList.remove('rovingFocus'); });
  }

  #togglePopover (force) { this.#popover.togglePopover({ force, source: this.#input }); }

  #updateStatus (message = '') { this.#output.value = message; }

  #findAndHide (option, query) {
    const found = option.value.toLowerCase().includes(query.trim().toLowerCase());
    if (!found) { option.parentElement.setAttribute('hidden', ''); }
    return found ? 1 : 0;
  }

  #setOptionByIndex (idx) {
    console.assert(typeof idx === 'number' && idx >= 0, 'Unexpected index');
    console.debug('setOption:', idx, this.#visibleOpt);
    const newOption = this.#visibleOpt[idx];
    console.assert(newOption, 'Missing new option');
    if (newOption) {
      this.#currentIndex = idx;
      this.#resetRovingFocus();
      newOption.classList.add('rovingFocus');
      this.#input.setAttribute('aria-activedescendant', newOption.id);
    }
    return newOption;
  }

  #setOptionByOffset (offset) {
    console.assert(typeof offset === 'number', 'Unexpected offset');
    // const prevOption = this.#visibleOpt[this.#currentIndex];
    const newOption = this.#setOptionByIndex(this.#currentIndex + offset);

    console.debug('offset:', offset, newOption);
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

    this.#currentIndex = -1;

    if (!this.#input.checkValidity()) {
      return this.#setError(this.#inputError);
    }

    if (this.value.length) {
      this.#togglePopover(true);
      this.#resetHidden();
      this.#optionElems.forEach((el) => { count += this.#findAndHide(el, this.value); });
      this.#reselectVisibleOptions();

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
    this.#reselectVisibleOptions();
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
