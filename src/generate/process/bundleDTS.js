import { getFileList }  from '@typhonjs-utils/file-util';
import fs               from 'fs-extra';

/**
 * @param {{ dom: boolean, esm: boolean, worker: boolean }}   generate -
 *
 * @returns {Promise<void>}
 */
export async function bundleDTS(generate)
{
   fs.ensureDirSync('./.doc-gen/bundled');
   fs.emptydirSync('./.doc-gen/bundled');

   if (generate.dom && fs.existsSync('./.doc-gen/transformed/dom'))
   {
      const filepaths = await getFileList({ dir: './.doc-gen/transformed/dom' });
      for (const filepath of filepaths)
      {
         fs.appendFileSync('./.doc-gen/bundled/index-dom.d.ts', fs.readFileSync(filepath));
      }
   }

   if (generate.esm && fs.existsSync('./.doc-gen/transformed/esm'))
   {
      const filepaths = await getFileList({ dir: './.doc-gen/transformed/esm' });
      for (const filepath of filepaths)
      {
         fs.appendFileSync('./.doc-gen/bundled/index-esm.d.ts', fs.readFileSync(filepath));
      }
   }

   if (generate.worker && fs.existsSync('./.doc-gen/transformed/worker'))
   {
      const filepaths = await getFileList({ dir: './.doc-gen/transformed/worker' });
      for (const filepath of filepaths)
      {
         fs.appendFileSync('./.doc-gen/bundled/index-worker.d.ts', fs.readFileSync(filepath));
      }
   }
}