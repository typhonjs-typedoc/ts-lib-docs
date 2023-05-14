import path             from 'node:path';

import { isIterable }   from '@typhonjs-utils/object';
import fs               from 'fs-extra';

/**
 * Processes DTS files moving them to `.doc-gen/source/<config name>`.
 *
 * @param {import('./types').GenerateConfig} config -
 */
export async function processDTS(config)
{
   fs.ensureDirSync('./.doc-gen/source');

   for (const name in config)
   {
      console.log(`Processing '${name}':`);

      fs.ensureDirSync(`./.doc-gen/source/${name}`);
      fs.emptyDirSync(`./.doc-gen/source/${name}`);

      for (const process of config[name].process)
      {
         // Await any filepaths list resolving as a Promise.
         const filepaths = process.filepaths instanceof Promise ? await process.filepaths : process.filepaths;

         for (const filepath of filepaths)
         {
            if (typeof filepath === 'string')
            {
               const filename = path.basename(filepath);
               if (processDTSFile(filepath, `./.doc-gen/source/${name}/${filename}`, process.preProcess))
               {
                  console.log(filename);
               }
            }
            else if (typeof filepath === 'object')
            {
               if (processDTSFile(filepath.source, `./.doc-gen/source/${name}/${filepath.rename}`, process.preProcess))
               {
                  console.log(filepath.rename);
               }
            }
         }
      }

      console.log('');
   }
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
 * @param {Iterable<(string) => string>} [preProcess] - A function to provide extra pre-processing.
 *
 * @returns {boolean} Wrote file.
 */
function processDTSFile(srcFilepath, destFilepath, preProcess)
{
   let srcData = fs.readFileSync(srcFilepath, 'utf-8');

   // Run any pre-processing.
   if (isIterable(preProcess))
   {
      for (const preProcessFn of preProcess)
      {
         if (typeof preProcessFn !== 'function') { throw new TypeError(`'preProcessFn' is not a function.`); }
         srcData = preProcessFn(srcData);
      }
   }

   // Substitute imported declarations to local `imports` from `package.json`.
   srcData = srcData.replaceAll(/^interface/gm, `export interface`);
   srcData = srcData.replaceAll(/^declare/gm, `export declare`);
   srcData = srcData.replaceAll(/^type/gm, `export type`);

   // Only write files that have actual data / exports.
   if ((/^export/gm).test(srcData))
   {
      fs.writeFileSync(destFilepath, srcData, 'utf-8');
      return true;
   }

   return false;
}