import { TransformProject }   from './transform/index.js';

/**
 * @param {GenerateConfig}   generateConfig - Which doc categories to generate.
 *
 * @returns {Promise<void>}
 */
export async function transformDTS(generateConfig)
{
   if (generateConfig.dom) { await new TransformProject(docsDOM).transform(); }
   if (generateConfig.esm) { await new TransformProject(docsESM).transform(); }
   if (generateConfig.worker) { await new TransformProject(docsWorker).transform(); }
}

/** @type {DocData} */
const docsDOM = {
   outDir: './.doc-gen/transformed/dom',

   sourceFiles: [
      './.doc-gen/source/lib.dom.d.ts',
      './.doc-gen/source/lib.dom.iterable.d.ts',
      './.doc-gen/source/extra.dom.webcodecs.d.ts',
      './.doc-gen/source/extra.dom.webcodecs.generated.d.ts',
      './.doc-gen/source/extra.dom.webgpu.d.ts'
   ],

   // The interfaces defined here must merge & override / replace any existing lib.dom values.
   mergeOverride: new Set([
      'extra.dom.webcodecs.generated.d.ts',
   ])
};

/** @type {DocData} */
const docsESM = {
   outDir: './.doc-gen/transformed/esm',

   sourceFiles: [
      './.doc-gen/source/lib.decorators.d.ts',
      './.doc-gen/source/lib.decorators.legacy.d.ts',
      './.doc-gen/source/lib.es5.d.ts',
      './.doc-gen/source/lib.es2015.collection.d.ts',
      './.doc-gen/source/lib.es2015.core.d.ts',
      './.doc-gen/source/lib.es2015.generator.d.ts',
      './.doc-gen/source/lib.es2015.iterable.d.ts',
      './.doc-gen/source/lib.es2015.promise.d.ts',
      './.doc-gen/source/lib.es2015.proxy.d.ts',
      './.doc-gen/source/lib.es2015.reflect.d.ts',
      './.doc-gen/source/lib.es2015.symbol.d.ts',
      './.doc-gen/source/lib.es2015.symbol.wellknown.d.ts',
      './.doc-gen/source/lib.es2016.array.include.d.ts',
      './.doc-gen/source/lib.es2017.intl.d.ts',
      './.doc-gen/source/lib.es2017.object.d.ts',
      './.doc-gen/source/lib.es2017.sharedmemory.d.ts',
      './.doc-gen/source/lib.es2017.string.d.ts',
      './.doc-gen/source/lib.es2017.typedarrays.d.ts',
      './.doc-gen/source/lib.es2018.asyncgenerator.d.ts',
      './.doc-gen/source/lib.es2018.asynciterable.d.ts',
      './.doc-gen/source/lib.es2018.intl.d.ts',
      './.doc-gen/source/lib.es2018.promise.d.ts',
      './.doc-gen/source/lib.es2018.regexp.d.ts',
      './.doc-gen/source/lib.es2019.array.d.ts',
      './.doc-gen/source/lib.es2019.intl.d.ts',
      './.doc-gen/source/lib.es2019.object.d.ts',
      './.doc-gen/source/lib.es2019.string.d.ts',
      './.doc-gen/source/lib.es2019.symbol.d.ts',
      './.doc-gen/source/lib.es2020.bigint.d.ts',
      './.doc-gen/source/lib.es2020.date.d.ts',
      './.doc-gen/source/lib.es2020.intl.d.ts',
      './.doc-gen/source/lib.es2020.number.d.ts',
      './.doc-gen/source/lib.es2020.promise.d.ts',
      './.doc-gen/source/lib.es2020.sharedmemory.d.ts',
      './.doc-gen/source/lib.es2020.string.d.ts',
      './.doc-gen/source/lib.es2020.symbol.wellknown.d.ts',
      './.doc-gen/source/lib.es2021.intl.d.ts',
      './.doc-gen/source/lib.es2021.promise.d.ts',
      './.doc-gen/source/lib.es2021.string.d.ts',
      './.doc-gen/source/lib.es2021.weakref.d.ts',
      './.doc-gen/source/lib.es2022.array.d.ts',
      './.doc-gen/source/lib.es2022.error.d.ts',
      './.doc-gen/source/lib.es2022.intl.d.ts',
      './.doc-gen/source/lib.es2022.object.d.ts',
      './.doc-gen/source/lib.es2022.regexp.d.ts',
      './.doc-gen/source/lib.es2022.sharedmemory.d.ts',
      './.doc-gen/source/lib.es2022.string.d.ts',
      './.doc-gen/source/lib.es2023.array.d.ts'
   ]
};

/** @type {DocData} */
const docsWorker = {
   outDir: './.doc-gen/transformed/worker',

   sourceFiles: [
      './.doc-gen/source/lib.webworker.d.ts',
      './.doc-gen/source/lib.webworker.importscripts.d.ts',
      './.doc-gen/source/lib.webworker.iterable.d.ts'
   ]
};
