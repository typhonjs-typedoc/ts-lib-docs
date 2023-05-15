/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
   {
      input: 'src/plugin/external/typedoc/ts-links/index.mjs',
      external: ['typedoc'],
      output: {
         file: 'dist/plugin/external/typedoc/ts-links/index.cjs',
         format: 'cjs',
         generatedCode: { constBindings: true },
         sourcemap: true
      }
   },

   {
      input: 'src/plugin/internal/typedoc/mdn-links/index.mjs',
      external: ['@mdn/browser-compat-data', 'fs-extra', 'typedoc'],
      output: {
         file: 'dist/plugin/internal/typedoc/mdn-links/index.cjs',
         format: 'cjs',
         generatedCode: { constBindings: true },
         sourcemap: true
      }
   }
];