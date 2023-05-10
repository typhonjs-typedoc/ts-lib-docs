import path             from 'node:path';

import { getFileList }  from "@typhonjs-utils/file-util";
import fs               from 'fs-extra';

/**
 * Processes TRL runtime & standard libraries along with the Svelte library moving DTS files to `.doc-gen`.
 */
export async function processDTS()
{
   fs.ensureDirSync('./.doc-gen/source');
   fs.emptyDirSync('./.doc-gen/source');

   await processPackageTypescript();
}

/**
 * Processes all DTS files while copying from the original library to `.doc-gen`. There are two processing steps:
 *
 * 1. All references for `declare`, `interface`, `type` are transformed to be exported.
 *
 * 2. Removal of any problematic content.
 *
 * @param {string}   srcFilepath - Source file path.
 *
 * @param {string}   destFilepath - Destination file path.
 *
 * @returns {boolean} Wrote file.
 */
function processDTSFile(srcFilepath, destFilepath)
{
   let srcData = fs.readFileSync(srcFilepath, 'utf-8');

   // Substitute imported declarations to local `imports` from `package.json`.
   srcData = srcData.replaceAll(/^interface/gm, `export interface`);
   srcData = srcData.replaceAll(/^declare/gm, `export declare`);
   srcData = srcData.replaceAll(/^type/gm, `export type`);

   // Remove code that causes further downstream problems.

   // Remove copyright comment blocks.
   srcData = srcData.replaceAll(/\/\*!(.|\n)*?\*\//gm, '');

   // Remove all reference comments.
   srcData = srcData.replaceAll(/\/\/\/ <reference.*\/>/gm, ``);

   // Only write files that have actual data / exports.
   if ((/^export/gm).test(srcData))
   {
      fs.writeFileSync(destFilepath, srcData, 'utf-8');
      return true;
   }

   return false;
}

const skipFilenames = [
   'lib.decorators.legacy',
   'lib.scripthost'
];

/**
 * Processes the typescript library declarations.
 */
async function processPackageTypescript()
{
   const filepaths = await getFileList({ dir: './node_modules/typescript/lib', ext: new Set(['.ts'])})

   for (const filepath of filepaths)
   {
      const name = path.basename(filepath, '.d.ts');
      if (name.startsWith('lib.') && !skipFilenames.includes(name))
      {
         if (processDTSFile(filepath, `./.doc-gen/source/${name}.d.ts`)) { console.log(name); }
      }
   }
}
