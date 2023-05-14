import { getFileList }  from '@typhonjs-utils/file-util';
import fs               from 'fs-extra';

/**
 * Appends all transformed individual declarations into a single declaration file.
 *
 * @param {import('./types').GenerateConfig} config -
 *
 * @returns {Promise<void>}
 */
export async function bundleDTS(config)
{
   fs.ensureDirSync('./.doc-gen/bundled');

   for (const name in config)
   {
      const transformDir = `./.doc-gen/transformed/${name}`;
      const bundleFilepath = `./.doc-gen/bundled/index-${name}.d.mts`;

      if (fs.existsSync(transformDir))
      {
         console.log(`Bundling '${name}':`);

         // Delete any existing bundled index.d.mts file.
         if (fs.existsSync(bundleFilepath)) { fs.unlinkSync(bundleFilepath); }

         const filepaths = await getFileList({ dir: transformDir, resolve: true });
         for (const filepath of filepaths)
         {
            fs.appendFileSync(bundleFilepath, fs.readFileSync(filepath));
         }
      }
      else
      {
         throw new Error(`There is no 'transformed' directory: ${transformDir}`);
      }
   }
}