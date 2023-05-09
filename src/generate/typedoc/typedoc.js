import fs                  from 'fs-extra';

import {
   Application,
   LogLevel,
   TSConfigReader }        from 'typedoc';

import {
   groupOrder,
   kindSortOrder,
   searchGroupBoosts }     from './options/index.js';

const configDOM = {
   name: 'Typescript Library Declarations (DOM)',
   entryPoints: ['./.doc-gen/bundled/index-dom.d.ts'],
   out: 'docs-dom',
   tsconfig: './tsconfig-dom.json'
}

const configESM = {
   name: 'Typescript Library Declarations (ES2023)',
   entryPoints: ['./.doc-gen/bundled/index-esm.d.ts'],
   out: 'docs-esm',
   tsconfig: './tsconfig-esm.json'
}

const configWorker = {
   name: 'Typescript Library Declarations (Web Worker)',
   entryPoints: ['./.doc-gen/bundled/index-worker.d.ts'],
   out: 'docs-worker',
   tsconfig: './tsconfig-worker.json'
}

export async function typedoc(logLevel = LogLevel.Info)
{
   if (fs.existsSync(configDOM.entryPoints[0])) { await generate(logLevel, configDOM); }
   if (fs.existsSync(configESM.entryPoints[0])) { await generate(logLevel, configESM); }
   if (fs.existsSync(configWorker.entryPoints[0])) { await generate(logLevel, configWorker); }
}

/**
 * Generate docs from TS declarations in `.doc-gen`.
 *
 * @param {LogLevel} [logLevel=LogLevel.Info] - The log level to use when generating Typedoc documentation.
 *
 * @param {{ name: string, entryPoints: string[], out: string, tsconfig: string }} config -
 *
 * @returns {Promise<void>}
 */
export async function generate(logLevel = LogLevel.Info, config)
{
   fs.emptydirSync(`./${config.out}`);

   // Create a new TypeDoc application instance
   const app = new Application();

   // Set TypeDoc options
   app.options.addReader(new TSConfigReader());

   app.bootstrap({
      name: config.name,

      // Disables the source links as they reference the d.ts files.
      disableSources: true,

      entryPoints: config.entryPoints,

      entryPointStrategy: 'expand',

      // For Typedoc v0.24+; sorts the main index for a namespace; not the sidebar tab.
      groupOrder,

      // Sorts the sidebar symbol types.
      kindSortOrder,

      // Hide the documentation generator footer.
      hideGenerator: true,

      // Sets log level.
      logLevel,

      // Output directory for the generated documentation
      out: config.out,

      plugin: [],

      // Boosts relevance for classes and function in search.
      searchGroupBoosts,

      theme: 'default',

      tsconfig: config.tsconfig
   });

   // Convert TypeScript sources to a TypeDoc ProjectReflection
   const project = app.convert();

   // Generate the documentation
   if (project)
   {
      return app.generateDocs(project, config.out);
   }
   else
   {
      console.error('Error: No project generated');
   }
}