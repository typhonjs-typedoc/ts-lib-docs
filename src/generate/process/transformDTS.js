import { TransformProject }   from './transform/index.js';

/**
 * @param {import('../types').GenerateConfig} config - Which doc categories to generate.
 *
 * @returns {Promise<void>}
 */
export async function transformDTS(config)
{
   for (const name in config)
   {
      console.log(`Transforming '${name}':`);

      await new TransformProject(config[name], name).transform();
   }
}