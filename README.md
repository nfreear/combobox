
# `<my-combobox>`

A custom element for an editable combobox, with list autocomplete.

APIs and techniques used:

* [Editable combobox pattern - ARIA Authoring Practices Guide (APG)][apg],
* [Accessible Rich Internet Applications (WAI-ARIA)][aria],
* [Popover API][pop],
* [Invoker Commands API][cmd]
* [Declarative Shadow DOM][dec]
* [Autonomous custom elements][el]

## Usage

CDN: [esm.sh/gh/nfreear/combobox][cdn]

```js
import MyComboboxElement from 'nfreear/combobox';

customElements.define('my-combobox', MyComboboxElement);
```

See [`index.html`][html] for a complete example, including shadow DOM:
```html
<my-combobox src="path/to/options.json">
  Choose a country
  <mytemplate shadowrootmode="open">
    ...
  </my-template>
</my-combobox>
```

# JSON format

```json
{
  "options": [
    {
      "name": "Afghanistan",  // Visual label
      "value": "Afghanistan", // Optional
      "code": "AF",           // Optional, country code based on ISO 3166-1 alpha-2
      "emoji": "🇦🇫"
    }
    ...
  ]
}
```

## Acknowledgements

Thanks to [@SebastianAigner][twemoji] and others for emoji flag support! (_Windows fix!_)

## License:

* [MIT License][mit]

[aria]: https://w3c.github.io/aria/#aria-autocomplete
[apg]: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/
[pop]: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
[cmd]: https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
[dec]: https://web.dev/articles/declarative-shadow-dom
[el]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
[html]: https://github.com/nfreear/combobox/blob/main/index.html
[cdn]: https://esm.sh/gh/nfreear/combobox
[mit]: https://nfreear.mit-license.org/2026

[twemoji]: https://github.com/SebastianAigner/twemoji-amazing
