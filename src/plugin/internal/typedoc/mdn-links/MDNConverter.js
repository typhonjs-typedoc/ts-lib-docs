import fs                     from 'fs-extra';

import { Converter }          from 'typedoc';

import {
   MDNBuildReflectionMap,
   MDNProcessReflectionMap }  from './processing/index.js';

import { PageRenderer }       from './renderer/PageRenderer.js';

import {
   MDNResolver,
   TSResolver }               from './resolvers/index.js';

/**
 * Provides symbol map generation linking MDN browser compatibility data to generated TS lib docs.
 */
export class MDNConverter
{
   /** @type {import('typedoc').Application} */
   #app;

   /**
    * This is the output path for the external symbol map.
    *
    * @type {string}
    */
   #mdnDataPath;

   /**
    * @type {ReflectionMaps}
    */
   #reflectionMaps = {
      external: new Map(),
      internal: new Map()
   };

   /**
    * @param {import('typedoc').Application} app - Typedoc application
    */
   constructor(app)
   {
      this.#app = app;

      this.#app.converter.on(Converter.EVENT_RESOLVE_END, this.#handleResolveEnd, this);
   }

   /**
    * @param {import('typedoc').Context}  context -
    */
   #handleResolveEnd(context)
   {
      const mdnDataPath = this.#app.options.getValue('mdnDataPath');

      if (typeof mdnDataPath !== 'string') { throw new TypeError(`'mdnDataPath' option is not a string.`); }

      // Register the PageRenderer in the resolve end callback to ensure that it runs after the theme callbacks.
      new PageRenderer(this.#app, this.#reflectionMaps);

      MDNBuildReflectionMap.buildReflectionMap(this.#reflectionMaps, this.#app, context.project);
      MDNProcessReflectionMap.processReflectionMap(this.#reflectionMaps, context.project);

      MDNResolver.resolve(this.#reflectionMaps);
      TSResolver.resolve(this.#reflectionMaps);

      fs.ensureDirSync(mdnDataPath);

      // Serialize the symbol map as object then save the keys / symbol names separately. Both of these JSON files are
      // used by other plugins.
      fs.writeFileSync(`${mdnDataPath}/reflection-mapping.json`,
       JSON.stringify(Object.fromEntries(this.#reflectionMaps.external)), 'utf-8');

      fs.writeFileSync(`${mdnDataPath}/reflection-names.json`,
       JSON.stringify([...this.#reflectionMaps.external.keys()]), 'utf-8');
   }
}