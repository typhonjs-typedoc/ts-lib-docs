import { rollup } from 'rollup';
import dts        from 'rollup-plugin-dts';

export async function bundleDTS()
{
   const bundle = await rollup({
      input: '.doc-gen/transformed/index.d.ts',
      plugins: [
         dts()
      ]
   });

   await bundle.write({
      file: '.doc-gen/bundled/index.d.ts',
      format: 'es',
      sourcemap: false
   });

   await bundle.close();
}