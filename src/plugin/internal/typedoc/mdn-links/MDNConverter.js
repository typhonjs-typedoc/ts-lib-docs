import fs                     from 'fs-extra';

import {
   Converter,
   RendererEvent
}          from 'typedoc';

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

      this.#app.converter.on(Converter.EVENT_RESOLVE_END, this.#handleResolveEnd.bind(this));
      this.#app.renderer.on(RendererEvent.BEGIN, this.#handleRendererBegin.bind(this), -200);
   }

   /**
    * @param {import('typedoc').Context}  context -
    */
   #handleRendererBegin(context)
   {
      /**
       * This is the output path for the external symbol map.
       *
       * @type {string}
       */
      const mdnDataPath = this.#app.options.getValue('mdnDataPath');

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

   /**
    */
   #handleResolveEnd()
   {
      // Register the PageRenderer in the resolve end callback to ensure that it runs after the theme callbacks.
      new PageRenderer(this.#app, this.#reflectionMaps);
   }
}