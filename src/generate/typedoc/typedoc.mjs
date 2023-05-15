import fs            from 'fs-extra';

import {
   Application,
   LogLevel,
   ParameterType,
   TSConfigReader }  from 'typedoc';

/**
 *
 * @param {import('./types').GenerateConfig} config -
 *
 * @param {import('typedoc').LogLevel} logLevel -
 */
export async function typedoc(config, logLevel = LogLevel.Info)
{
   for (const entry of config.entries)
   {
      const entryPath = `${config.year}/${entry.name}`;

      /** @type {import('../types').TypeDocConfig} */
      const typedocConfig = Object.assign({
         entryPoints: [`./.doc-gen/bundled/${entryPath}/index.d.mts`],
         out: `docs/${entryPath}`,
         tsconfig: `./tsconfig/${entryPath}/tsconfig-docs.json`
      }, entry.typedoc);

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

      // Add internal symbol processing / MDN linking plugin.
      typedocConfig.plugin.unshift('./dist/plugin/internal/typedoc/mdn-links/index.cjs');

      if (fs.existsSync(typedocConfig.entryPoints[0]))
      {
         console.log(`Generating documentation for '${entryPath}':`);
         await generate(typedocConfig, logLevel, `./data/${entryPath}`);
      }
      else
      {
         throw new Error(
          `Could not find bundled entry point for project '${entryPath}': ${typedocConfig?.entryPoints?.[0]}`);
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
 * @param {string} mdnDataPath - The generate config data path for internal mdn-links plugin.
 *
 * @returns {Promise<void>}
 */
async function generate(config, logLevel, mdnDataPath)
{
   if (fs.existsSync(`./${config.out}`)) { fs.emptydirSync(`./${config.out}`); }

   // Create a new TypeDoc application instance
   const app = new Application();

   // Set TypeDoc options
   app.options.addReader(new TSConfigReader());

   // Add option to pass the config year to plugins.
   app.options.addDeclaration({
      name: 'mdnDataPath',
      help: 'This is output path for the internal mdn-links plugin.',
      type: ParameterType.String,
      defaultValue: null,
   });

   await app.bootstrapWithPlugins({
      name: config.name,

      mdnDataPath,

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
   }
   else
   {
      console.error('Error: No project generated');
   }
}
