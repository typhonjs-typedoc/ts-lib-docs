![@typhonjs-typedoc/ts-lib-docs](https://i.imgur.com/vzvOB5E.jpg)

[![NPM](https://img.shields.io/npm/v/@typhonjs-typedoc/ts-lib-docs.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-typedoc/ts-lib-docs)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-typedoc/ts-lib-docs/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/737953117999726592?label=TyphonJS%20Discord)](https://typhonjs.io/discord/)
[![Twitch](https://img.shields.io/twitch/status/typhonrt?style=social)](https://www.twitch.tv/typhonrt)

Provides comprehensive API docs for the Typescript built-in libs covering the [DOM](https://typhonjs-typedoc.github.io/ts-lib-docs/2024/dom/), 
[ES2023](https://typhonjs-typedoc.github.io/ts-lib-docs/2024/es/), and 
[Web Worker](https://typhonjs-typedoc.github.io/ts-lib-docs/2024/worker/) APIs. The DOM API docs also include the 
WebCodecs, WebGPU, and WebXR APIs.

The docs are generated from the following sources:
- Typescript built-in libs (5.6.2)
- @types/dom-webcodecs (0.1.11)
- @webgpu/types (0.1.45)
- @types/webxr (0.5.20)

The `@mdn/browser-compat-data` (5.6.1) package is cross-linked against all symbols and a web component 
provides links to MDN docs _and_ relevant specifications embedded in the API docs provided.

------------

If you are using TypeDoc to generate documentation there are several plugins available to link all TS built-in lib 
symbols to the hosted TS Lib docs. You can find the NPM package here: [@typhonjs-typedoc/ts-lib-docs](https://www.npmjs.com/package/@typhonjs-typedoc/ts-lib-docs) 

Include the following in your `devDependencies` in `package.json`:
```json
{
   "devDependencies": {
      "@typhonjs-typedoc/ts-lib-docs": "2024.9.18",
      "@typhonjs-typedoc/typedoc-theme-dmt": "^0.2.0",
      "typedoc": "^0.26.6"
   }
}
```
The date of generation `<year>.<month>.<day>` is used instead of normal SEMVER.

Then in your TypeDoc configuration / JSON include:

```json
{
   "plugin": [         
      "@typhonjs-typedoc/typedoc-theme-dmt",
      "@typhonjs-typedoc/ts-lib-docs/typedoc/ts-links/dom/2024",
      "@typhonjs-typedoc/ts-lib-docs/typedoc/ts-links/es/2024"
   ]
}
```

You should choose either the "dom" or "worker" `ts-lib-docs` plugin and not both. The "worker" plugin is omitted from 
the above example. The `es` plugin includes the Typescript built-in library Javascript API.

### Synergy

- The TS Lib docs are generated with the Default Modern Theme / [@typhonjs-typedoc/typedoc-theme-dmt](https://www.npmjs.com/package/@typhonjs-typedoc/typedoc-theme-dmt). This is a 
theme augmentation that adds features and fixes rough edges of the default TypeDoc theme.


- A zero / low configuration CLI frontend [@typhonjs-typedoc/typedoc-pkg](https://www.npmjs.com/package/@typhonjs-typedoc/typedoc-pkg) 
is available for TypeDoc that supports generating documentation from repositories utilizing `package.json` configured 
with export condition types. 

------------

Please note that the TS Lib API docs are presently hosted through Github pages while a permanent hosting location is 
found. IE if this gets popular GH bandwidth concerns may come into play.

You may open an issue at [ts-lib-docs](https://github.com/typhonjs-typedoc/ts-lib-docs) repository for discussion / 
feedback.
