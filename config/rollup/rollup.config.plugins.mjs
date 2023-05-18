import replace    from '@rollup/plugin-replace';

// These plugins are for the mdn-links web components.

import image      from '@rollup/plugin-image';
import resolve    from '@rollup/plugin-node-resolve';
import terser     from '@rollup/plugin-terser';
import svelte     from 'rollup-plugin-svelte';
import preprocess from 'svelte-preprocess';

/**
 * Stores the years to generate configs for below.
 *
 * @type {string[]}
 */
const years = [
   '2023'
];

/**
 * Stores the libs to generate configs for below.
 *
 * @type {string[]}
 */
const libs = [
   'dom',
   'esm',
   'worker'
];

/**
 * @type {import('rollup').RollupOptions[]}
 */
const configs = [
   {
      input: 'src/plugin/internal/typedoc/mdn-links/index.mjs',
      external: [
         '@mdn/browser-compat-data',
         '@typhonjs-utils/file-util',
         'cheerio',
         'fs-extra',
         'node:path',
         'node:url',
         'typedoc'
      ],
      output: {
         file: 'dist/plugin/internal/typedoc/mdn-links/index.cjs',
         format: 'cjs',
         generatedCode: { constBindings: true },
         sourcemap: true
      }
   },

   {
      input: 'src/plugin/internal/typedoc/mdn-links/web-components/index.mjs',
      treeshake: false,
      output: {
         file: 'dist/plugin/internal/typedoc/mdn-links/mdn-web-components.js',
         format: 'es',
         generatedCode: { constBindings: true },
         plugins: [terser()],
         sourcemap: true
      },
      plugins: [
         image(),

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
   },

   {
      input: 'src/plugin/external/typedoc/ts-links-checker/index.mjs',
      external: ['typedoc'],
      output: {
         file: `dist/plugin/external/typedoc/ts-links-checker/index.cjs`,
         format: 'cjs',
         generatedCode: { constBindings: true },
         sourcemap: true
      }
   }
];

for (const year of years)
{
   for (const lib of libs)
   {
      configs.push({
         input: 'src/plugin/external/typedoc/ts-links/index.mjs',
         external: ['node:fs', 'node:path', 'node:url', 'typedoc'],
         output: {
            file: `dist/plugin/external/typedoc/ts-links/${year}/${lib}/index.cjs`,
            format: 'cjs',
            generatedCode: { constBindings: true },
            sourcemap: true
         },
         plugins: [
            replace({
               preventAssignment: true,
               values: {
                  REPLACE_YEAR: year,
                  REPLACE_LIB: `'${lib}'`,
                  REPLACE_HOST: `'http://localhost:63342/ts-lib-docs/docs/${year}/${lib}'`
               }
            })
         ]
      });
   }
}

export default configs;