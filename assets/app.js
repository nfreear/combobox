import MyComboboxElement from '../src/MyComboboxElement.js';
import MyDevWarningElement from 'ndf-elements/dev';

const { customElements, location } = globalThis;
const { resolve, url } = import.meta;
const defaultTagName = 'my-autocomplete-combobox';
const defaultUrlArray = ['https://unpkg.com/country-flag-emoji-json@^2', resolve('./countries.en.json')];

if (url.includes('run=def')) {
  demoApp();
} else if (url.includes('run=select')) {
  demoApp('my-select-combobox', [null, resolve('./mammals.en.json')]);
  // demoApp('my-select-combobox', [null, resolve('./us-states.en.json')]);
}

export default async function demoApp (tagName = defaultTagName, urlArray = defaultUrlArray) {
  customElements.define(tagName, MyComboboxElement);
  customElements.define('my-dev-warning', MyDevWarningElement);

  const FORM = document.querySelector('form');
  const comboboxElement = FORM.querySelector(tagName);
  const ALL = location.search.includes('all');
  const jsonUrl = ALL ? urlArray[0] : urlArray[1];
  console.assert(FORM, 'Missing form');
  console.assert(comboboxElement.constructor.formAssociated, 'Expect form-associated');

  FORM.addEventListener('submit', (ev) => onSubmit(ev));

  comboboxElement.options = await fetchJsonOptions(jsonUrl);
}

export async function fetchJsonOptions (jsonUrl) {
  console.debug('json URL:', jsonUrl);
  const response = await fetch(jsonUrl);
  console.assert(response.ok, `Fetch error: ${response.status}`);
  const data = await response.json();
  const options = Array.isArray(data) ? data : data.options;
  console.assert(Array.isArray(options) && options.length, 'Missing option data');
  return options;
}

export function onSubmit (event, key = 'mycb') {
  event.preventDefault();

  const { elements } = event.target;
  const { name, value, validity } = elements[key];

  elements.output.value = `${name}: ${value}`;
  console.debug('Form submit:', name, value, validity, elements, event);
}
