[![Deploy][ci-badge]][ci]

# `<my-combobox>`

A [form-associated][form] custom element for an editable combobox, with list autocomplete.

* [nfreear.github.io/combobox][ghp]

Web APIs, standards & techniques used:

* [Editable combobox pattern - ARIA Authoring Practices Guide (APG)][apg],
* [Accessible Rich Internet Applications (WAI-ARIA)][aria],
* [Popover API][pop],
* [Invoker Commands API][cmd]
* [Declarative Shadow DOM][dec]
* [Autonomous custom elements][el]

## Usage

CDN: [esm.sh/gh/nfreear/combobox][cdn]

JavaScript:
```js
import MyComboboxElement from 'nfreear/combobox';

customElements.define('my-combobox', MyComboboxElement);

const comboBox = document.querySelector('my-combobox');

// Set an options array.
comboBox.options = [
  {
    "name": "Afghanistan",  // Required, visual label.
    "value": "afghanistan", // Optional.
    "code": "AF",           // Optional, country code based on ISO 3166-1 alpha-2
    "emoji": "🇦🇫"           // Optional.
  }
  // ...
];
```

Form submission:
```js
const form = document.querySelector('form');

form.addEventListener('submit', (event) => {
  const { name, value, validity } = comboBox;
  console.debug('Form submit:', name, value, event);
});
```

See [`index.html`][html] for a complete example, including shadow DOM:
```html
<form>
  <label for="cty">Choose a country</label>

  <my-combobox id="cty" name="country">
    <mytemplate shadowrootmode="open">
      ...
    </my-template>
  </my-combobox>

  <button>Submit</button>
</form>
```

## Forms

The `<my-combobox>` custom element participates in HTML forms. Specifically, it has the following readonly properties, similar to an [`<input>`][input] element:

* `name` - Name that identifies the element when submitting the form.
* `value` - The current value of the control.
* `validity` - Returns the element's current validity state.
* `validityMessage` - Returns a localized message that describes the validation constraints that the control does not satisfy (if any).
* `willValidate` -
* `form` - Returns a reference to the parent `<form>` element.
* `labels` - Returns a list of `<label>` elements that are labels for this element.
* `required` - A boolean that represents the element's `required` attribute.
* `minLength` - A number that represents the element's `minlength` attribute.

### `<label for>`

Note that a `<label for>` element only works with the custom element because it is [form-associated][form], and has been coded to support it.

In general, custom elements do __not__ support `<label for>`!

## Acknowledgements

Thanks to [@SebastianAigner][twemoji], [@risan][] and others for emoji flag support! (_Windows fix!_)

## License:

* [MIT License][mit]

[ci-badge]: https://github.com/nfreear/combobox/actions/workflows/deploy.yml/badge.svg
[ci]: https://github.com/nfreear/combobox/actions/workflows/deploy.yml
[ghp]: https://nfreear.github.io/combobox/

[aria]: https://w3c.github.io/aria/#aria-autocomplete
[apg]: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/
[pop]: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
[cmd]: https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
[dec]: https://web.dev/articles/declarative-shadow-dom
[el]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
[form]: https://web.dev/articles/more-capable-form-controls
[input]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement#instance_properties
[html]: https://github.com/nfreear/combobox/blob/main/index.html
[cdn]: https://esm.sh/gh/nfreear/combobox
[mit]: https://nfreear.mit-license.org/2026

[twemoji]: https://github.com/SebastianAigner/twemoji-amazing
[@risan]: https://github.com/risan/country-flag-emoji-json
[@amio]: https://github.com/amio/emoji.json
