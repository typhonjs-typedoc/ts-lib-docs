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

      /** @type {import('../types.js').TypeDocConfig} */
      const typedocConfig = Object.assign({
         entryPoints: [`./.doc-gen/bundled/${entryPath}/index.d.ts`],
         out: `docs/${entryPath}`,
         tsconfig: `./config/tsconfig/${entryPath}/tsconfig-docs.json`
      }, entry.typedoc);

      // Ensure that there is a plugin array defined.
      if (!Array.isArray(typedocConfig.plugin)) { typedocConfig.plugin = []; }

      // Add DMT theme and internal reflection processing / mdn-links plugin.
      typedocConfig.plugin.push(
         '@typhonjs-typedoc/typedoc-theme-dmt',
         './dist/plugin/internal/typedoc/mdn-links/index.js'
      );

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
 * @param {import('../types.js').TypeDocConfig} config -
 *
 * @param {LogLevel} logLevel - The log level to use when generating Typedoc documentation.
 *
 * @param {string} mdnDataPath - The generate config data path for internal mdn-links plugin.
 *
 * @returns {Promise<void>}
 */
async function generate(config, logLevel, mdnDataPath)
{
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

      // Adds mdn-links CSS variables.
      customCss: './styles/custom.css',

      mdnDataPath,

      // Disables the source links as they reference the d.ts files.
      disableSources: config.disableSources ?? true,

      dmtFavicon: config.favicon,

      entryPoints: config.entryPoints,

      // Hide the documentation generator footer.
      hideGenerator: config.hideGenerator ?? true,

      kindSortOrder,

      // Sets log level.
      logLevel: config.logLevel ?? logLevel,

      // Output directory for the generated documentation.
      out: config.out,

      plugin: config.plugin,

      theme: 'default-modern',

      tsconfig: config.tsconfig,

      // Only show the `inherited` filter.
      visibilityFilters: {
         inherited: true,
      }
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

/**
 * Provides a small alteration to the default kind sort order putting `Class` below `Interface`. Only the WebXR
 * declarations have a few classes.
 *
 * @type {string[]}
 */
const kindSortOrder = [
   'Reference',
   'Project',
   'Module',
   'Namespace',
   'Enum',
   'EnumMember',
   'Interface',
   'Class',
   'TypeAlias',
   'Constructor',
   'Property',
   'Variable',
   'Function',
   'Accessor',
   'Method',
   'ObjectLiteral',
   'Parameter',
   'TypeParameter',
   'TypeLiteral',
   'CallSignature',
   'ConstructorSignature',
   'IndexSignature',
   'GetSignature',
   'SetSignature'
]