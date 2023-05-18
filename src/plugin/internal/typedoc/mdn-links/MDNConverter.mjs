import fs                     from 'fs-extra';

import {
   Converter,
   ReflectionKind }           from 'typedoc';

import {
   MDNBuildReflectionMap,
   MDNProcessReflectionMap }  from './processing/index.mjs';

import { PageRenderer }       from './renderer/PageRenderer.mjs';

import {
   MDNResolver,
   TSResolver }               from './resolvers/index.mjs';

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
    * @type {SymbolMaps}
    */
   #symbolMaps = {
      external: new Map(),
      internal: new Map()
   }

   /**
    * @param {import('typedoc').Application} app - Typedoc application
    */
   constructor(app)
   {
      this.#app = app;

      this.#mdnDataPath = app.options.getValue('mdnDataPath');

      if (typeof this.#mdnDataPath !== 'string') { throw new TypeError(`'mdnDataPath' option is not a string.`); }

      this.#app.converter.on(Converter.EVENT_RESOLVE_END, this.#handleResolveEnd, this);

      new PageRenderer(app, this.#symbolMaps);
   }

   /**
    * @param {import('typedoc').Context}  context -
    */
   #handleResolveEnd(context)
   {
      MDNBuildReflectionMap.buildReflectionMap(this.#symbolMaps, this.#app, context.project);
      MDNProcessReflectionMap.processReflectionMap(this.#symbolMaps, context.project)

      MDNResolver.resolve(this.#symbolMaps);
      TSResolver.resolve(this.#symbolMaps);

      fs.ensureDirSync(this.#mdnDataPath);

      // Serialize the symbol map as object then save the keys / symbol names separately. Both of these JSON files are
      // used by other plugins.
      fs.writeFileSync(`${this.#mdnDataPath}/symbol-mapping.json`,
       JSON.stringify(Object.fromEntries(this.#symbolMaps.external)), 'utf-8');

      fs.writeFileSync(`${this.#mdnDataPath}/symbol-names.json`,
       JSON.stringify([...this.#symbolMaps.external.keys()]), 'utf-8');
   }
}

/**
 * @typedef {object} DataMDNCompat
 *
 * @property {import('@mdn/browser-compat-data').StatusBlock}  [status] MDN status block.
 *
 * @property {import('@mdn/browser-compat-data').SupportBlock} [support] MDN support block.
 */

/**
 * @typedef {object} DataMDNLinks
 *
 * @property {string}            [mdn_url] Any associated MDN URL.
 *
 * @property {string | string[]} [spec_url] Any associated specification URLs.
 *
 * @property {string}            [ts_url] Any associated Typescript documentation URL.
 */

/**
 * @typedef {object} DataSymbolLink
 *
 * @property {string}               doc_url The partial link to the generated documentation.
 *
 * @property {import('typedoc').ReflectionKind} kind The reflection kind.
 *
 * @property {string}               [mdn_url] Any associated MDN URL.
 *
 * @property {string | string[]}    [spec_url] Any associated specification URLs.
 *
 * @property {string}               [ts_url] Any associated Typescript documentation URL.
 */

/**
 * @typedef {object} DataSymbolLinkInternal
 *
 * @property {string}               name The fully qualified symbol name.
 *
 * @property {string[]}             parts The separate symbol name parts used in MDN browser compat lookups.
 *
 * @property {DataSymbolParents[]}  parents An array of parent reflections.
 *
 * @property {boolean}              hasCompat Indicates that there is MDN compatibility data.
 *
 * @property {boolean}              hasLinks Indicates that there is MDN link data.
 *
 * @property {DataMDNLinks}         mdnCompat The MDN compatibility data.
 *
 * @property {DataMDNLinks}         mdnLinks The MDN links data.
 */

/**
 * @typedef {object} DataSymbolParents
 *
 * @property {number}               id ID of reflection.
 *
 * @property {ReflectionKind}       kind ReflectionKind.
 *
 * @property {string}               name Name of reflection.
 *
 * @property {string[]}             parts Individual parts of the reflection name split on `.`.
 *
 * @property {DataSymbolParents[]}  parents Parent reflections.
 */

/**
 * @typedef {object} SymbolMaps
 *
 * @property {Map<string, DataSymbolLink>}   external External data used by plugins.
 *
 * @property {Map<import('typedoc').DeclarationReflection, DataSymbolLinkInternal>} internal Data used internally.
 */