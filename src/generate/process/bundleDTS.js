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

   for (const entry of config.entries)
   {
      const entryPath = `${config.year}/${entry.name}`;
      const bundleDirPath = `./.doc-gen/bundled/${entryPath}`;

      const transformDir = `./.doc-gen/transformed/${entryPath}`;
      const bundleFilepath = `${bundleDirPath}/index.d.mts`;

      fs.ensureDirSync(bundleDirPath);

      if (fs.existsSync(transformDir))
      {
         console.log(`Bundling '${entryPath}':`);

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