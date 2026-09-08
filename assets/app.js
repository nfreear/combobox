import MyComboboxElement from '../src/MyComboboxElement.js';

const { customElements, location } = globalThis;
const defaultTagName = 'my-autocomplete-combobox';
const defaultUrlArray = ['https://unpkg.com/country-flag-emoji-json@^2', 'assets/countries.en.json'];

if (import.meta.url.includes('run=def')) {
  demoApp();
} else if (import.meta.url.includes('run=select')) {
  demoApp('my-select-combobox', [null, 'assets/us-states.en.json']);
}

export default async function demoApp (tagName = defaultTagName, urlArray = defaultUrlArray) {
  customElements.define(tagName, MyComboboxElement);

  const comboboxElement = document.querySelector(tagName);
  const FORM = document.querySelector('form');
  const ALL = location.search.includes('all');
  const jsonUrl = ALL ? urlArray[0] : urlArray[1];
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

export function onSubmit (event, key = 'country') {
  event.preventDefault();

  const { elements } = event.target;
  const { name, value, validity } = elements[key]; // comboboxElement;

  elements.output.value = `${name}: ${value}`;
  console.debug('Form submit:', name, value, validity, elements, event);
}
