import fs                  from 'node:fs';
import { fileURLToPath }   from 'node:url';
import path                from 'node:path';

/** @type {import('../../../types/index-json-mapping').DataSymbolMap} */
const data = JSON.parse(fs.readFileSync(
 `${path.dirname(fileURLToPath(import.meta.url))}${path.sep}symbol-mapping.json`, 'utf-8'));

export default data;
