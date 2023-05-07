import resolve          from '@rollup/plugin-node-resolve';
import dts              from 'rollup-plugin-dts';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
   input: '.doc-gen/index.d.ts',
   plugins: [
      resolve(),
      dts()
   ],
   output: {
      file: '.doc-gen/bundled/es2023.d.ts',
      format: 'es',
      generatedCode: { constBindings: true },
      sourcemap: false
   }
};