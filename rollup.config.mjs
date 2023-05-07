/**
 * @type {import('rollup').RollupOptions}
 */
export default {
   input: 'src/plugin/ts-links/index.js',
   external: ['typedoc'],
   output: {
      file: 'dist/plugin/ts-links/index.cjs',
      format: 'cjs',
      generatedCode: { constBindings: true },
      sourcemap: true
   }
};