import { pathToFileURL }   from 'node:url';
import path                from 'node:path';

import fs                  from 'fs-extra';

import { bundleDTS }       from './process/bundleDTS.js';
import { processDTS }      from './process/processDTS.js';
import { transformDTS }    from './process/transformDTS.js';
import { typedoc }         from './typedoc/typedoc.js';

const configPath = path.resolve(`./src/generate/config/${process.env.CONFIG_YEAR}/config.js`);

if (!fs.existsSync(configPath)) { throw new Error(`Could not locate generate config at: \n${configPath}`); }

const { config } = await import(pathToFileURL(configPath));

if (typeof config !== 'object') { throw new Error(`Invalid config loaded at: \n${configPath}`); }
if (typeof config?.year !== 'number') { throw new Error(`Invalid config loaded at: \n${configPath}`); }
if (!Array.isArray(config.entries)) { throw new Error(`Invalid config loaded at: \n${configPath}`); }

console.log(`Loaded config at: \n${configPath}\n`);

// Initial processing of TS declaration libraries moving DTS files to `.doc-gen/source`.
await processDTS(config);

// Transform TS libraries combining all symbols together across all DTS files and output individual DTS files to
// `.doc-gen/transformed`.
await transformDTS(config);

// Bundle transformed DTS files into a single declaration file.
await bundleDTS(config);

// Generate TypeDoc documentation from `.doc-gen/bundled`.
await typedoc(config);
