import { preProcessTSLib } from '../util/preProcessTSLib.mjs';

/**
 * @type {import('../../types').GenerateConfigEntry}
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
      favicon: './assets/icons/worker.ico'
   }
};