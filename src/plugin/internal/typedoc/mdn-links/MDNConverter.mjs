import fs               from 'fs-extra';

import {
   Converter,
   DefaultTheme,
   ProjectReflection,
   ReferenceType,
   ReflectionKind }     from 'typedoc';

import { PageRenderer } from './renderer/PageRenderer.mjs';

import {
   MDNResolver,
   TSResolver }         from './resolvers/index.mjs';

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

   #regexIsSymbol = /\[(?<inner>.*)]/;

   /**
    * @type {SymbolMaps}
    */
   #symbolMaps = {
      external: new Map(),
      internal: new Map()
   }

   /**
    * Stores the valid reflection kinds when processing DeclarationReflections.
    *
    * @type {Set<ReflectionKind>}
    */
   #validReflectionKind = new Set([
      ReflectionKind.Accessor,
      ReflectionKind.Class,
      ReflectionKind.Constructor,
      ReflectionKind.Enum,
      ReflectionKind.EnumMember,
      ReflectionKind.Function,
      ReflectionKind.Interface,
      ReflectionKind.Method,
      ReflectionKind.Namespace,
      ReflectionKind.Property,
      ReflectionKind.TypeAlias,     // TODO: There is a note that this will be deprecated in `0.25.x`!
      ReflectionKind.TypeLiteral,
      ReflectionKind.TypeParameter,
      ReflectionKind.Variable
   ]);

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
    * @param {ProjectReflection} project -
    *
    * @param {Map<import('typedoc').DeclarationReflection, string>} reflectionUrlMap -
    */
   #buildSymbolMap(project, reflectionUrlMap)
   {
      /**
       * @param {ProjectReflection | import('typedoc').DeclarationReflection}  reflection -
       *
       * @param {string} parentUrl -
       */
      const visit = (reflection, parentUrl = '') =>
      {
         const reflectionUrl = reflectionUrlMap.get(reflection);

         const url = reflectionUrl ? reflectionUrl : parentUrl +
          (parentUrl && reflection.parent ? `#${reflection.getAlias()}` : '');

         if (this.#validReflectionKind.has(reflection.kind))
         {
            const { isSymbol, symbolName, symbolParts } = this.#getSymbolData(reflection);

            // In the case of processing TS libs often there is an interface defined and a subsequent function by the
            // same name so only update the symbol map if an existing interface doesn't exist.
            const currentValue = this.#symbolMaps.external.get(symbolName);
            if (!isSymbol && (currentValue === void 0 || currentValue?.kind !== ReflectionKind.Interface))
            {
               this.#symbolMaps.external.set(symbolName, {
                  doc_url: url,
                  kind: reflection.kind
               });
            }

            this.#symbolMaps.internal.set(reflection, {
               name: symbolName,
               parents: [],
               parts: symbolParts,
               hasLinks: false,
               hasCompat: false,
               mdnCompat: {},
               mdnLinks: {}
            });
         }

         if (reflection.children)
         {
            for (const child of reflection.children) { visit(child, reflectionUrl ? reflectionUrl : url); }
         }
      };

      visit(project);
   }

   /**
    * TODO: THIS NEEDS TO BE VETTED! Currently only finding inheritance chains for main interfaces. Must validate
    * functions / other reflection kinds.
    *
    * @param {ProjectReflection} project -
    *
    * @param {import('typedoc').DeclarationReflection}   reflection -
    *
    * @returns {DataSymbolParents} Any parent reflections.
    */
   #getInheritanceTree(project, reflection)
   {
      const visited = new Set();

      const visit = (reflection) =>
      {
         if (visited.has(reflection)) { return null; }

         visited.add(reflection);

         let parents = [];

         if (reflection.extendedTypes)
         {
            for (let extendedType of reflection.extendedTypes)
            {
               if (extendedType instanceof ReferenceType && extendedType._target)
               {
                  let parentReflection = project.getReflectionById(extendedType._target);

                  // Keep resolving if another reference type is returned.
                  while (parentReflection && parentReflection instanceof ReferenceType && parentReflection._target)
                  {
                     parentReflection = project.getReflectionById(extendedType._target);
                  }

                  if (parentReflection)
                  {
                     const parent = visit(parentReflection);
                     if (parent) { parents.push(parent); }
                  }
               }
            }
         }

         return {
            id: reflection.id,
            kind: reflection.kind,
            name: reflection.getFullName(),
            parts: reflection.getFullName().split('.'),
            parents
         };
      }

      return visit(reflection);
   }

   /**
    * @param {import('typedoc').Reflection}  reflection -
    *
    * @returns {{ isSymbol: boolean, symbolName: string, symbolParts: string[] }} The fully qualified symbol data.
    */
   #getSymbolData(reflection)
   {
      const parts = [];

      while (reflection)
      {
         // Do not include the project reflection.
         if (reflection instanceof ProjectReflection) { break; }

         parts.unshift(reflection.name);
         reflection = reflection.parent;
      }

      const symbolName = parts.join('.');

      let isSymbol = false;

      // Process parts and rename any `[<inner>]` Symbol references with `@@<inner>` for MDN browser compat lookup.
      for (let cntr = 0; cntr < parts.length; cntr++)
      {
         if (this.#regexIsSymbol.test(parts[cntr]))
         {
            isSymbol = true;
            parts[cntr] = parts[cntr].replace(this.#regexIsSymbol, '@@$<inner>');
         }
      }

      return { isSymbol, symbolName, symbolParts: parts };
   }

   /**
    * @param {import('typedoc').Context}  context -
    */
   #handleResolveEnd(context)
   {
      const urlMappings = new DefaultTheme(this.#app.renderer).getUrls(context.project);
      const reflectionUrlMap = new Map(urlMappings.map((mapping) => [mapping.model, mapping.url]));

      this.#buildSymbolMap(context.project, reflectionUrlMap);



      // Resolve inheritance chains.
      for (const reflection of this.#symbolMaps.internal.keys())
      {
         if (reflection instanceof ProjectReflection) { continue; }

         const result = this.#getInheritanceTree(context.project, reflection);

         if (result.parents.length)
         {
            this.#symbolMaps.internal.get(reflection).parents = result.parents;
         }
      }

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