import replace             from '@rollup/plugin-replace';

// These plugins are for the mdn-links web components.
import { importsResolve }  from "@typhonjs-build-test/rollup-plugin-pkg-imports";
import image               from '@rollup/plugin-image';
import resolve             from '@rollup/plugin-node-resolve';
import terser              from '@rollup/plugin-terser';
import svelte              from 'rollup-plugin-svelte';
import preprocess          from 'svelte-preprocess';

/**
 * Stores the years to generate configs for below.
 *
 * @type {string[]}
 */
const years = [
   '2024'
];

/**
 * Stores the libs to generate configs for below.
 *
 * @type {string[]}
 */
const libs = [
   'dom',
   'es',
   'worker'
];

/**
 * @type {import('rollup').RollupOptions[]}
 */
const configs = [
   {
      input: 'src/plugin/internal/typedoc/mdn-links/index.js',
      external: [
         '#runtime/data/format/msgpack/compress',
         '@mdn/browser-compat-data/forLegacyNode',
         '@typhonjs-utils/file-util',
         'cheerio',
         'fs-extra',
         'node:path',
         'node:url',
         'typedoc'
      ],
      output: {
         file: 'dist/plugin/internal/typedoc/mdn-links/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         sourcemap: true
      }
   },

   {
      input: 'src/plugin/internal/typedoc/mdn-links/web-components/index.js',
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

         importsResolve(),

         resolve({
            browser: true,
            dedupe: ['svelte']
         }),
      ]
   },

   {
      input: 'src/plugin/external/typedoc/ts-links-checker/index.js',
      external: ['typedoc'],
      output: {
         file: `dist/plugin/external/typedoc/ts-links-checker/index.js`,
         format: 'es',
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
         input: 'src/plugin/external/typedoc/ts-links/index.js',
         external: ['node:fs', 'node:path', 'node:url', 'typedoc'],
         output: {
            file: `dist/plugin/external/typedoc/ts-links/${year}/${lib}/index.js`,
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap: true
         },
         plugins: [
            replace({
               preventAssignment: true,
               values: {
                  REPLACE_YEAR: year,
                  REPLACE_LIB: `'${lib}'`,
                  REPLACE_HOST: `'https://typhonjs-typedoc.github.io/ts-lib-docs/${year}/${lib}'`
               }
            })
         ]
      });
   }
}

export default configs;