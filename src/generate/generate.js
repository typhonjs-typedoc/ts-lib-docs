import { bundleDTS }    from './process/bundleDTS.js';
import { processDTS }   from './process/processDTS.js';
import { transformDTS } from './process/transformDTS.js';
import { typedoc }      from './typedoc/typedoc.js';

/**
 * Controls which libs are generated. The DOM libs are separated from the ESM libs
 *
 * @type {{ dom: boolean, esm: boolean, worker: boolean }}
 */
const generate = {
   dom: true,
   esm: true,
   worker: true
}

// Initial processing of TS declaration libraries moving DTS files to `.doc-gen/source`.
// await processDTS();

// Transform TS libraries combining all symbols together across all DTS files and output individual DTS files to
// `.doc-gen/transformed`.
// await transformDTS(generate);

// Bundle transformed DTS files into a single declaration file.
// await bundleDTS(generate);

// Generate TypeDoc documentation from `.doc-gen/bundled`.
await typedoc();
