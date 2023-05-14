import fs            from 'fs-extra';

import {
   Application,
   LogLevel,
   TSConfigReader }  from 'typedoc';

import { generateUrlMap }  from './generateUrlMap.js';

/**
 *
 * @param {import('./types').GenerateConfig} config -
 *
 * @param {import('typedoc').LogLevel} logLevel -
 */
export async function typedoc(config, logLevel = LogLevel.Info)
{
   for (const name in config)
   {
      /** @type {import('../types').TypeDocConfig} */
      const typedocConfig = Object.assign({
         entryPoints: [`./.doc-gen/bundled/index-${name}.d.mts`],
         out: `docs-${name}`,
         tsconfig: `./tsconfig-docs-${name}.json`
      }, config[name].typedoc);

      // Ensure that there is a plugin array defined and if `typedoc-plugin-extras` is not included then add it.
      if (Array.isArray(typedocConfig.plugin))
      {
         if (!typedocConfig.plugin.includes('typedoc-plugin-extras'))
         {
            typedocConfig.plugin.push('typedoc-plugin-extras');
         }
      }
      else
      {
         typedocConfig.plugin = ['typedoc-plugin-extras'];
      }

      if (fs.existsSync(typedocConfig.entryPoints[0]))
      {
         console.log(`Generating documentation for '${name}':`);
         await generate(typedocConfig, logLevel);
      }
      else
      {
         throw new Error(
          `Could not find bundled entry point for project '${name}': ${typedocConfig?.entryPoints?.[0]}`);
      }
   }
}

/**
 * Generate docs from TS declarations in `.doc-gen`.
 *
 * @param {import('../types').TypeDocConfig} config -
 *
 * @param {LogLevel} logLevel - The log level to use when generating Typedoc documentation.
 *
 * @returns {Promise<void>}
 */
async function generate(config, logLevel)
{
   if (fs.existsSync(`./${config.out}`)) { fs.emptydirSync(`./${config.out}`); }

   // Create a new TypeDoc application instance
   const app = new Application();

   // Set TypeDoc options
   app.options.addReader(new TSConfigReader());

   await app.bootstrapWithPlugins({
      name: config.name,

      // Disables the source links as they reference the d.ts files.
      disableSources: config.disableSources ?? true,

      entryPoints: config.entryPoints,

      favicon: config.favicon,

      // Hide the documentation generator footer.
      hideGenerator: config.hideGenerator ?? true,

      // Sets log level.
      logLevel: config.logLevel ?? logLevel,

      // Output directory for the generated documentation.
      out: config.out,

      plugin: config.plugin,

      theme: 'default',

      tsconfig: config.tsconfig
   });

   // Create TypeDoc ProjectReflection.
   const project = app.convert();

   // Generate documentation and URL map.
   if (project)
   {
      await app.generateDocs(project, config.out);

      // generateUrlMap(app, project);
   }
   else
   {
      console.error('Error: No project generated');
   }
}
