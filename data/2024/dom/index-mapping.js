import fs                  from 'node:fs';
import { fileURLToPath }   from 'node:url';
import path                from 'node:path';

/** @type {import('../../../types/index-json-mapping').DataReflectionMap} */
const data = JSON.parse(fs.readFileSync(
 `${path.dirname(fileURLToPath(import.meta.url))}${path.sep}reflection-mapping.json`, 'utf-8'));

export default data;
