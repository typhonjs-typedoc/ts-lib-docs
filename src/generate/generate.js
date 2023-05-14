import { bundleDTS }    from './process/bundleDTS.js';
import { processDTS }   from './process/processDTS.js';
import { transformDTS } from './process/transformDTS.js';
import { typedoc }      from './typedoc/typedoc.js';

import { config }       from './config/generateConfig.js';

// Initial processing of TS declaration libraries moving DTS files to `.doc-gen/source`.
await processDTS(config);

// Transform TS libraries combining all symbols together across all DTS files and output individual DTS files to
// `.doc-gen/transformed`.
await transformDTS(config);

// Bundle transformed DTS files into a single declaration file.
await bundleDTS(config);

// Generate TypeDoc documentation from `.doc-gen/bundled`.
await typedoc(config);
