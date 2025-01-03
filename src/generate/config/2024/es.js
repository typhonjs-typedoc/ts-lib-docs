import { getFileList }     from '@typhonjs-utils/file-util';

import { preProcessTSLib } from '../util/preProcessTSLib.js';

/**
 * @type {import('../../types.js').GenerateConfigEntry}
 */
export const es = {
   name: 'es',

   process: [{
      filepaths: getFileList({
         dir: './node_modules/typescript/lib',
         includeFile: /^(lib\.decorators|lib\.es\d).*\.d\.ts$/,
         resolve: true
      }),

      preProcess: [preProcessTSLib]
   }],

   transform: {
      // In this case we need a specific order for processing.
      filenames: [
         'lib.decorators.d.ts',
         'lib.decorators.legacy.d.ts',
         'lib.es5.d.ts',
         'lib.es2015.collection.d.ts',
         'lib.es2015.core.d.ts',
         'lib.es2015.generator.d.ts',
         'lib.es2015.iterable.d.ts',
         'lib.es2015.promise.d.ts',
         'lib.es2015.proxy.d.ts',
         'lib.es2015.reflect.d.ts',
         'lib.es2015.symbol.d.ts',
         'lib.es2015.symbol.wellknown.d.ts',
         'lib.es2016.array.include.d.ts',
         'lib.es2016.intl.d.ts',
         'lib.es2017.intl.d.ts',
         'lib.es2017.arraybuffer.d.ts',
         'lib.es2017.date.d.ts',
         'lib.es2017.intl.d.ts',
         'lib.es2017.object.d.ts',
         'lib.es2017.sharedmemory.d.ts',
         'lib.es2017.string.d.ts',
         'lib.es2017.typedarrays.d.ts',
         'lib.es2018.asyncgenerator.d.ts',
         'lib.es2018.asynciterable.d.ts',
         'lib.es2018.intl.d.ts',
         'lib.es2018.promise.d.ts',
         'lib.es2018.regexp.d.ts',
         'lib.es2019.array.d.ts',
         'lib.es2019.intl.d.ts',
         'lib.es2019.object.d.ts',
         'lib.es2019.string.d.ts',
         'lib.es2019.symbol.d.ts',
         'lib.es2020.bigint.d.ts',
         'lib.es2020.date.d.ts',
         'lib.es2020.intl.d.ts',
         'lib.es2020.number.d.ts',
         'lib.es2020.promise.d.ts',
         'lib.es2020.sharedmemory.d.ts',
         'lib.es2020.string.d.ts',
         'lib.es2020.symbol.wellknown.d.ts',
         'lib.es2021.intl.d.ts',
         'lib.es2021.promise.d.ts',
         'lib.es2021.string.d.ts',
         'lib.es2021.weakref.d.ts',
         'lib.es2022.array.d.ts',
         'lib.es2022.error.d.ts',
         'lib.es2022.intl.d.ts',
         'lib.es2022.object.d.ts',
         'lib.es2022.regexp.d.ts',
         'lib.es2022.string.d.ts',
         'lib.es2023.array.d.ts',
         'lib.es2023.collection.d.ts',
         'lib.es2023.intl.d.ts',
         'lib.es2024.arraybuffer.d.ts',
         'lib.es2024.collection.d.ts',
         'lib.es2024.object.d.ts',
         'lib.es2024.promise.d.ts',
         'lib.es2024.regexp.d.ts',
         'lib.es2024.sharedmemory.d.ts',
         'lib.es2024.string.d.ts',
      ]
   },

   typedoc: {
      name: 'Typescript Library Declarations (ES2024)',
      favicon: './assets/icons/es.ico',
      plugin: [
         './dist/plugin/external/typedoc/ts-links-checker/index.js'
      ]
   }
};