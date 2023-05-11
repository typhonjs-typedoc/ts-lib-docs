import fs            from 'fs-extra';

import {
   Application,
   LogLevel,
   TSConfigReader }  from 'typedoc';

import { generateUrlMap }  from './generateUrlMap.js';

const configDOM = {
   name: 'Typescript Library Declarations (DOM)',
   entryPoints: ['./.doc-gen/bundled/index-dom.d.ts'],
   favicon: './assets/icons/dom.ico',
   out: 'docs-dom',
   tsconfig: './tsconfig-dom.json'
};

const configESM = {
   name: 'Typescript Library Declarations (ES2023)',
   entryPoints: ['./.doc-gen/bundled/index-esm.d.ts'],
   favicon: './assets/icons/esm.ico',
   out: 'docs-esm',
   tsconfig: './tsconfig-esm.json'
};

const configWorker = {
   name: 'Typescript Library Declarations (Web Worker)',
   entryPoints: ['./.doc-gen/bundled/index-worker.d.ts'],
   favicon: './assets/icons/worker.ico',
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
 * @param {LogLevel} logLevel - The log level to use when generating Typedoc documentation.
 *
 * @param {{ name: string, entryPoints: string[], favicon: string, out: string, tsconfig: string }} config -
 *
 * @returns {Promise<void>}
 */
async function generate(logLevel, config)
{
   fs.emptydirSync(`./${config.out}`);

   // Create a new TypeDoc application instance
   const app = new Application();

   // Set TypeDoc options
   app.options.addReader(new TSConfigReader());

   await app.bootstrapWithPlugins({
      name: config.name,

      // Disables the source links as they reference the d.ts files.
      disableSources: true,

      entryPoints: config.entryPoints,

      favicon: config.favicon,

      // Hide the documentation generator footer.
      hideGenerator: true,

      // Sets log level.
      logLevel,

      // Output directory for the generated documentation.
      out: config.out,

      plugin: ['typedoc-plugin-extras'],

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
