import { bundleDTS }    from './process/bundleDTS.mjs';
import { processDTS }   from './process/processDTS.mjs';
import { transformDTS } from './process/transformDTS.mjs';
import { typedoc }      from './typedoc/typedoc.mjs';

import { config }       from './config/2023/config.mjs';

// Initial processing of TS declaration libraries moving DTS files to `.doc-gen/source`.
await processDTS(config);

// Transform TS libraries combining all symbols together across all DTS files and output individual DTS files to
// `.doc-gen/transformed`.
await transformDTS(config);

// Bundle transformed DTS files into a single declaration file.
await bundleDTS(config);

// Generate TypeDoc documentation from `.doc-gen/bundled`.
await typedoc(config);
