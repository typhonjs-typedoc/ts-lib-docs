import { getFileList }  from '@typhonjs-utils/file-util';
import fs               from 'fs-extra';

/**
 * Appends all transformed individual declarations into a single declaration file.
 *
 * @param {GenerateConfig}   generateConfig - Which doc categories to generate.
 *
 * @returns {Promise<void>}
 */
export async function bundleDTS(generateConfig)
{
   fs.ensureDirSync('./.doc-gen/bundled');
   fs.emptydirSync('./.doc-gen/bundled');

   if (generateConfig.dom && fs.existsSync('./.doc-gen/transformed/dom'))
   {
      const filepaths = await getFileList({ dir: './.doc-gen/transformed/dom' });
      for (const filepath of filepaths)
      {
         fs.appendFileSync('./.doc-gen/bundled/index-dom.d.ts', fs.readFileSync(filepath));
      }
   }

   if (generateConfig.esm && fs.existsSync('./.doc-gen/transformed/esm'))
   {
      const filepaths = await getFileList({ dir: './.doc-gen/transformed/esm' });
      for (const filepath of filepaths)
      {
         fs.appendFileSync('./.doc-gen/bundled/index-esm.d.ts', fs.readFileSync(filepath));
      }
   }

   if (generateConfig.worker && fs.existsSync('./.doc-gen/transformed/worker'))
   {
      const filepaths = await getFileList({ dir: './.doc-gen/transformed/worker' });
      for (const filepath of filepaths)
      {
         fs.appendFileSync('./.doc-gen/bundled/index-worker.d.ts', fs.readFileSync(filepath));
      }
   }
}