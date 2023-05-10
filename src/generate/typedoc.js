import fs            from 'fs-extra';

import {
   Application,
   LogLevel,
   TSConfigReader }  from 'typedoc';

const configDOM = {
   name: 'Typescript Library Declarations (DOM)',
   entryPoints: ['./.doc-gen/bundled/index-dom.d.ts'],
   out: 'docs-dom',
   tsconfig: './tsconfig-dom.json'
};

const configESM = {
   name: 'Typescript Library Declarations (ES2023)',
   entryPoints: ['./.doc-gen/bundled/index-esm.d.ts'],
   out: 'docs-esm',
   tsconfig: './tsconfig-esm.json'
};

const configWorker = {
   name: 'Typescript Library Declarations (Web Worker)',
   entryPoints: ['./.doc-gen/bundled/index-worker.d.ts'],
   out: 'docs-worker',
   tsconfig: './tsconfig-worker.json'
};

/**
 *
 * @param {GenerateConfig} generateConfig -
 *
 * @param {import('typedoc').LogLevel} logLevel -
 */
export async function typedoc(generateConfig, logLevel = LogLevel.Info)
{
   if (generateConfig.dom && fs.existsSync(configDOM.entryPoints[0])) { await generate(logLevel, configDOM); }
   if (generateConfig.esm && fs.existsSync(configESM.entryPoints[0])) { await generate(logLevel, configESM); }
   if (generateConfig.worker && fs.existsSync(configWorker.entryPoints[0])) { await generate(logLevel, configWorker); }
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

      // Hide the documentation generator footer.
      hideGenerator: true,

      // Sets log level.
      logLevel,

      // Output directory for the generated documentation
      out: config.out,

      plugin: [],

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