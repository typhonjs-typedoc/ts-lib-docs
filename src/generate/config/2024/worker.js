import { preProcessTSLib } from '../util/preProcessTSLib.js';

/**
 * @type {import('../../types.js').GenerateConfigEntry}
 */
export const worker = {
   name: 'worker',

   process: [{
      filepaths: [
         './node_modules/typescript/lib/lib.webworker.d.ts',
         './node_modules/typescript/lib/lib.webworker.importscripts.d.ts',
         './node_modules/typescript/lib/lib.webworker.iterable.d.ts',
      ],

      preProcess: [preProcessTSLib]
   }],

   transform: {
      filenames: [
         'lib.webworker.d.ts',
         'lib.webworker.importscripts.d.ts',
         'lib.webworker.iterable.d.ts'
      ]
   },

   typedoc: {
      name: 'Typescript Library Declarations (Web Worker)',
      favicon: './assets/icons/worker.ico',
      plugin: [
         './dist/plugin/external/typedoc/ts-links/2023/esm/index.js',
         './dist/plugin/external/typedoc/ts-links-checker/index.js'
      ]
   }
};