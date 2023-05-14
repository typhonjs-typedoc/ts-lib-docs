import { preProcessTSLib } from './preProcessTSLib.js';

/**
 * @type {import('../types').GenerateConfigEntry}
 */
export const dom = {
   process: [
      {
         filepaths: [
            './node_modules/typescript/lib/lib.dom.d.ts',
            './node_modules/typescript/lib/lib.dom.iterable.d.ts',
            {
               source: './node_modules/@types/dom-webcodecs/index.d.ts',
               rename: 'extra.dom.webcodecs.d.ts'
            },
            {
               source: './node_modules/@types/dom-webcodecs/webcodecs.generated.d.ts',
               rename: 'extra.dom.webcodecs.generated.d.ts'
            },
            {
               source: './node_modules/@webgpu/types/dist/index.d.ts',
               rename: 'extra.webgpu.d.ts'
            }
         ],

         preProcess: [preProcessTSLib]
      },

      {
         filepaths: [
            {
               source: './node_modules/@types/dom-webcodecs/index.d.ts',
               rename: 'extra.dom.webcodecs.d.ts'
            },
            {
               source: './node_modules/@types/dom-webcodecs/webcodecs.generated.d.ts',
               rename: 'extra.dom.webcodecs.generated.d.ts'
            }
         ],

         preProcess: [preProcessTSLib, preProcessWebCodec]
      }
   ],

   transform: {
      sourceFiles: [
         'lib.dom.d.ts',
         'lib.dom.iterable.d.ts',
         'extra.dom.webcodecs.d.ts',
         'extra.dom.webcodecs.generated.d.ts',
         'extra.dom.webgpu.d.ts'
      ],

      // The interfaces defined here must merge & override / replace any existing lib.dom values.
      mergeOverride: new Set([
         'extra.dom.webcodecs.generated.d.ts',
      ])
   },

   typedoc: {
      name: 'Typescript Library Declarations (DOM)',
      favicon: './assets/icons/dom.ico',
      tsconfig: './tsconfig-dom.json'
   }
};

/**
 * Currently in the @types/dom-webcodecs package several required type aliases are commented out (2023.5.10).
 *
 * @param {string}   srcData - Source declaration
 *
 * @returns {string} Processed declaration.
 */
function preProcessWebCodec(srcData)
{
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