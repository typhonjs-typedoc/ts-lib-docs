import { preProcessTSLib } from '../util/preProcessTSLib.js';

/**
 * @type {import('../../types.js').GenerateConfigEntry}
 */
export const dom = {
   name: 'dom',

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
         // Needs special handling to remove unnecessary abstract classes.
         filepaths: [
            {
               source: './node_modules/@types/webxr/index.d.ts',
               rename: 'extra.webxr.d.ts'
            }
         ],

         preProcess: [preProcessTSLib, preProcessWebXR]
      }
   ],

   transform: {
      filenames: [
         'lib.dom.d.ts',
         'lib.dom.iterable.d.ts',
         'extra.dom.webcodecs.d.ts',
         'extra.dom.webcodecs.generated.d.ts',
         'extra.webgpu.d.ts',
         'extra.webxr.d.ts'
      ],

      // The interfaces defined here must merge & override / replace any existing lib.dom values.
      mergeOverride: new Set([
         'extra.dom.webcodecs.generated.d.ts',
      ])
   },

   typedoc: {
      name: 'Typescript Library Declarations (DOM)',
      favicon: './assets/icons/dom.ico',
      plugin: [
         './dist/plugin/external/typedoc/ts-links/2023/esm/index.js',
         './dist/plugin/external/typedoc/ts-links-checker/index.js'
      ]
   }
};

/**
 * Currently in the @types/webxr package empty abstract classes duplicate interfaces. These abstract classes can be
 * removed except for `XRLayer`.
 *
 * @param {string}   srcData - Source declaration
 *
 * @returns {string} Processed declaration.
 */
function preProcessWebXR(srcData)
{
   srcData = srcData.replaceAll(/declare abstract class (?!.*XRLayer).*}/gm, '');

   return srcData;
}