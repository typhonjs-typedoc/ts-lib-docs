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
   await processPackageWebGPUAndCodecs();
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
 * @param {(string) => string} [preProcess] - A function to provide extra pre-processing.
 *
 * @returns {boolean} Wrote file.
 */
function processDTSFile(srcFilepath, destFilepath, preProcess)
{
   let srcData = fs.readFileSync(srcFilepath, 'utf-8');

   // Run any pre processing.
   if (typeof preProcess === 'function') { srcData = preProcess(srcData); }

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

/**
 * Exclude Windows specific lib declaration.
 *
 * @type {string[]}
 */
const skipFilenames = [
   'lib.scripthost'
];

/**
 * Processes the typescript library declarations.
 */
async function processPackageTypescript()
{
   const filepaths = await getFileList({ dir: './node_modules/typescript/lib', ext: new Set(['.ts']) });

   for (const filepath of filepaths)
   {
      const name = path.basename(filepath, '.d.ts');
      if (name.startsWith('lib.') && !skipFilenames.includes(name))
      {
         if (processDTSFile(filepath, `./.doc-gen/source/${name}.d.ts`)) { console.log(name); }
      }
   }
}

/**
 * Processes the WebGPU library declarations.
 */
async function processPackageWebGPUAndCodecs()
{
   // For WebGPU -----------------------------------------------------------------------------------------------------

   if (processDTSFile('./node_modules/@webgpu/types/dist/index.d.ts', `./.doc-gen/source/extra.dom.webgpu.d.ts`))
   {
      console.log('extra.dom.webgpu');
   }

   // For WebCodecs --------------------------------------------------------------------------------------------------

   if (processDTSFile('./node_modules/@types/dom-webcodecs/index.d.ts', `./.doc-gen/source/extra.dom.webcodecs.d.ts`))
   {
      console.log('extra.dom.webcodecs');
   }

   // Currently in the @types/dom-webcodecs package several required type aliases are commented out (2023.5.10).
   const preProcess = (srcData) => {
      srcData = srcData.replace('// type AlphaOption', 'type AlphaOption');
      srcData = srcData.replace('// type AvcBitstreamFormat', 'type AvcBitstreamFormat');
      srcData = srcData.replace('// type BitrateMode', 'type BitrateMode');
      srcData = srcData.replace('// type CodecState', 'type CodecState');
      srcData = srcData.replace('// type EncodedVideoChunkType', 'type EncodedVideoChunkType');
      srcData = srcData.replace('// type LatencyMode', 'type LatencyMode');
      srcData = srcData.replace('// type VideoPixelFormat', 'type VideoPixelFormat');

      // Entirely missing from types!
      srcData += 'type VideoEncoderBitrateMode = "constant" | "variable";'

      return srcData;
   }

   if (processDTSFile('./node_modules/@types/dom-webcodecs/webcodecs.generated.d.ts',
    `./.doc-gen/source/extra.dom.webcodecs.generated.d.ts`, preProcess))
   {
      console.log('extra.dom.webcodecs.generated');
   }
}
