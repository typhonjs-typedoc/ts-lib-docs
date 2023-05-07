import {
   Application,
   Logger,
   LogLevel,
   TSConfigReader }        from 'typedoc';

import {
   entryPoints,
   externalSymbolLinkMappings,
   // groupOrder,
   kindSortOrder,
   navigationLinks,
   searchGroupBoosts }     from './options/index.js';

/**
 * Generate docs from TS declarations in `.doc-gen`.
 *
 * @param {LogLevel} [logLevel=LogLevel.Info] The log level to use when generating Typedoc documentation.
 *
 * @returns {Promise<void>}
 */
export async function typedoc(logLevel = LogLevel.Info)
{
   // Create a new TypeDoc application instance
   const app = new Application();

   // Set TypeDoc options
   app.options.addReader(new TSConfigReader());

   app.bootstrap({
      name: 'Typescript Library Declarations (ES2023)',

      // Provide a link for the title / name.
      // TODO: not supported by typedoc-theme-yaf.
      // titleLink: '',

      // Provides custom CSS.
      // TODO: typedoc-theme-yaf doesn't link it; this needs to be added: <link rel="stylesheet" href="../assets/custom.css">
      customCss: './styles/custom.css',

      // Disables the source links as they reference the d.ts files.
      // TODO: typedoc-theme-yaf does not completely remove text as "Defined in:" still displays.
      disableSources: true,

      entryPoints,
      entryPointStrategy: 'expand',

      // Excludes any private members including the `#private;` member added by Typescript.
      excludePrivate: true,

      // For external API linking for @link tags.
      externalSymbolLinkMappings,

      // For Typedoc v0.24+; sorts the main index for a namespace; not the sidebar tab.
      // TODO: Enable when switching to Typedoc 0.24+
      // groupOrder,

      // Sorts the sidebar symbol types.
      // TODO: not supported by typedoc-theme-yaf.
      kindSortOrder,

      // Hide the documentation generator footer.
      // TODO: not supported by typedoc-theme-yaf.
      hideGenerator: true,

      // Sets the custom logger for Typedoc 0.23; unnecessary for 0.24+
      // TODO: Remove when switching to Typedoc `0.24+`.
      logger: new CustomLogger(logLevel),

      // Sets log level.
      logLevel,

      // Provides links for the top nav bar
      // TODO: not supported by typedoc-theme-yaf.
      navigationLinks,

      // Output directory for the generated documentation
      out: 'docs',

      plugin: [
         // './dist/plugin/foundry-links/index.cjs',
         'typedoc-plugin-coverage',
         'typedoc-plugin-mdn-links',
         'typedoc-theme-yaf'
      ],

      // Boosts relevance for classes and function in search.
      searchGroupBoosts,

      theme: 'yaf'
   });

   // Convert TypeScript sources to a TypeDoc ProjectReflection
   const project = app.convert();

   // Generate the documentation
   if (project)
   {
      return app.generateDocs(project, 'docs');
   }
   else
   {
      console.error('Error: No project generated');
   }
}

/**
 * Create a custom Typedoc logger.
 *
 * TODO: Remove when switching to Typedoc `0.24+`.
 */
class CustomLogger extends Logger
{
   /** @type {LogLevel} */
   #logLevel;

   /**
    * @param {LogLevel} [logLevel=LogLevel.Info] The logging level for generated logs.
    */
   constructor(logLevel = LogLevel.Info)
   {
      super();

      this.#logLevel = logLevel;
   }

   log(message, level)
   {
      if (level < this.#logLevel) { return; }

      switch (level)
      {
         case LogLevel.Verbose:
         case LogLevel.Info:
            console.log(message);
            break;

         case LogLevel.Warn:
            console.warn(message);
            break;

         case LogLevel.Error:
            console.error(message);
            break;
      }
   }
}
