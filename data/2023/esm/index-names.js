import fs                  from 'node:fs';
import { fileURLToPath }   from 'node:url';
import path                from 'node:path';

/** @type {import('../../../types/index-json-names').DataReflectionNames} */
const data = JSON.parse(fs.readFileSync(
 `${path.dirname(fileURLToPath(import.meta.url))}${path.sep}reflection-names.json`, 'utf-8'));

export default data;
