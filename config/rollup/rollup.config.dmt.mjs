import image      from '@rollup/plugin-image';
import resolve    from '@rollup/plugin-node-resolve';
import terser     from '@rollup/plugin-terser';
import svelte     from 'rollup-plugin-svelte';
import preprocess from 'svelte-preprocess';

/**
 * @type {import('rollup').RollupOptions[]}
 */
const configs = [
   {
      input: 'src/plugin/internal/typedoc/dmt-theme/index.mjs',
      external: [
         'cheerio',
         'fs-extra',
         'node:path',
         'node:url',
         'typedoc'
      ],
      output: {
         file: 'dist/plugin/internal/typedoc/dmt-theme/index.cjs',
         format: 'cjs',
         generatedCode: { constBindings: true },
         sourcemap: true
      }
   },

   {
      input: 'src/plugin/internal/typedoc/dmt-theme/web-components/index.mjs',
      treeshake: false,
      output: {
         file: 'dist/plugin/internal/typedoc/dmt-theme/dmt-web-components.js',
         format: 'es',
         generatedCode: { constBindings: true },
         plugins: [terser()],
         sourcemap: true
      },
      plugins: [
         // image(),

         svelte({
            compilerOptions: {
               customElement: true
            },
            preprocess: preprocess()
         }),

         resolve({
            browser: true,
            dedupe: ['svelte']
         }),
      ]
   }
];

export default configs;