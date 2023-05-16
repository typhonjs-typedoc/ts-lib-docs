import fs                  from 'node:fs';
import { fileURLToPath }   from 'node:url';
import path                from 'node:path';

/** @type {import('../../../types/index-json-names').DataSymbolNames} */
const data = JSON.parse(fs.readFileSync(
 `${path.dirname(fileURLToPath(import.meta.url))}${path.sep}symbol-names.json`, 'utf-8'));

export default data;
