Provides comprehensive API docs for the Typescript built-in libs covering the [DOM](https://typhonjs-typedoc.github.io/ts-lib-docs/2023/dom/), 
[ES2023](https://typhonjs-typedoc.github.io/ts-lib-docs/2023/esm/), and 
[Web Worker](https://typhonjs-typedoc.github.io/ts-lib-docs/2023/worker/) APIs. The DOM API docs also include the 
WebCodecs, WebGPU, and WebXR APIs.

The docs are generated from the following sources:
- Typescript built-in libs (5.1.6)
- @types/dom-webcodecs (0.1.8)
- @webgpu/types (0.1.32)
- @types/webxr (0.5.2)

The `@mdn/browser-compat-data` (5.3.1) package is cross-linked against all symbols and a web component 
provides links to MDN docs _and_ relevant specifications embedded in the API docs provided.

------------

If you are using TypeDoc to generate documentation there are several plugins available to link all TS built-in lib 
symbols to the hosted TS Lib docs. You can find the NPM package here: [@typhonjs-typedoc/ts-lib-docs](https://www.npmjs.com/package/@typhonjs-typedoc/ts-lib-docs) 

Include the following in your `devDependencies` in `package.json`:
```json
{
   "devDependencies": {
      "@typhonjs-typedoc/ts-lib-docs": "2023.7.10",
      "@typhonjs-typedoc/typedoc-theme-dmt": "^0.1.0",
      "typedoc": "^0.24.8"
   }
}
```
The date of generation `<year>.<month>.<day>` is used instead of normal SEMVER.

Then in your TypeDoc configuration / JSON include:

```json
{
   "plugin": [         
      "@typhonjs-typedoc/typedoc-theme-dmt",
      "@typhonjs-typedoc/ts-lib-docs/typedoc/ts-links/dom/2023",
      "@typhonjs-typedoc/ts-lib-docs/typedoc/ts-links/esm/2023"
   ]
}
```

You should choose either the "dom" or "worker" `ts-lib-docs` plugin and not both. The "worker" plugin is omitted from 
the above example.

------------

A brand new Typedoc theme [@typhonjs-typedoc/typedoc-theme-dmt](https://www.npmjs.com/package/@typhonjs-typedoc/typedoc-theme-dmt) / 
(Default Modern Theme) / theme augmentation is used to generate the TS Lib docs. The biggest feature is a massive 
reduction in disk space utilized upwards of 90% for large documentation projects like this one along with an 80% speed 
improvement when generating docs. The DMT theme is not necessary to link your TypeDoc doc generation. 

------------

Please note that the TS Lib API docs are presently hosted through Github pages while a permanent hosting location is 
found. IE if this gets popular GH bandwidth concerns may come into play.

You may open an issue at [ts-lib-docs](https://github.com/typhonjs-typedoc/ts-lib-docs) repository for discussion / 
feedback.