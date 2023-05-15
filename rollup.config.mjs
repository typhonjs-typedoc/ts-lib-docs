/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
   {
      input: 'src/plugin/external/typedoc/ts-links/index.js',
      external: ['typedoc'],
      output: {
         file: 'dist/plugin/external/typedoc/ts-links/index.cjs',
         format: 'cjs',
         generatedCode: { constBindings: true },
         sourcemap: true
      }
   },

   {
      input: 'src/plugin/internal/typedoc/mdn-links/index.js',
      external: ['@mdn/browser-compat-data', 'node:fs', 'typedoc'],
      output: {
         file: 'dist/plugin/internal/typedoc/mdn-links/index.cjs',
         format: 'cjs',
         generatedCode: { constBindings: true },
         sourcemap: true
      }
   }
];