import { TransformProject }   from './transform/index.js';

/**
 * @param {import('../types.js').GenerateConfig} config - Which doc categories to generate.
 *
 * @returns {Promise<void>}
 */
export async function transformDTS(config)
{
   for (const entry of config.entries)
   {
      console.log(`Transforming '${config.year}/${entry.name}':`);

      await new TransformProject(entry, config.year).transform();
   }
}