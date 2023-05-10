import { bundleDTS }    from './process/bundleDTS.js';
import { processDTS }   from './process/processDTS.js';
import { transformDTS } from './process/transformDTS.js';
import { typedoc }      from './typedoc/typedoc.js';

/**
 * Controls which libs are generated. The DOM libs are separated from the ESM libs
 *
 * @type {GenerateConfig}
 */
const generateConfig = {
   dom: true,
   esm: true,
   worker: true
};

// Initial processing of TS declaration libraries moving DTS files to `.doc-gen/source`.
await processDTS();

// Transform TS libraries combining all symbols together across all DTS files and output individual DTS files to
// `.doc-gen/transformed`.
await transformDTS(generateConfig);

// Bundle transformed DTS files into a single declaration file.
await bundleDTS(generateConfig);

// Generate TypeDoc documentation from `.doc-gen/bundled`.
await typedoc(generateConfig);

/**
 * @typedef {object} GenerateConfig Defines which lib categories to generate.
 *
 * @property {boolean} dom Docs for DOM related lib declarations.
 *
 * @property {boolean} esm Docs for ESM / Javascript related lib declarations.
 *
 * @property {boolean} worker Docs for Web Worker related lib declarations.
 */