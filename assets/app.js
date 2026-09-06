import MyComboboxElement from '../src/MyComboboxElement.js';

const { customElements, location } = globalThis;

if (import.meta.url.includes('run')) {
  demoApp();
}

export default async function demoApp () {
  customElements.define('my-autocomplete-combobox', MyComboboxElement);

  const comboboxElement = document.querySelector('my-autocomplete-combobox');
  const FORM = document.querySelector('form');
  const ALL = location.search.includes('all');
  const jsonUrl = ALL ? 'https://unpkg.com/country-flag-emoji-json@^2' : 'assets/countries.en.json';
  console.debug('json URL:', jsonUrl);

  FORM.addEventListener('submit', (ev) => {
    ev.preventDefault();

    const { value } = comboboxElement;

    console.debug('submit:', value, FORM.elements, ev);
  });

  const response = await fetch(jsonUrl);
  console.assert(response.ok, `Fetch error: ${response.status}`);
  const data = await response.json();
  const options = Array.isArray(data) ? data : data.options;
  console.assert(Array.isArray(options) && options.length, 'Missing option data');

  comboboxElement.options = options;
}
