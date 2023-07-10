import fs from 'fs-extra';
import { ReflectionKind, DefaultTheme, ProjectReflection, ReferenceType, PageEvent, RendererEvent, Converter } from 'typedoc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packAndDeflateB64 } from '#runtime/data/format/msgpack/compress';
import { load as load$1 } from 'cheerio';
import browserCompatData from '@mdn/browser-compat-data/forLegacyNode';

class MDNBuildReflectionMap
{
   /**
    * Detects if a reflection name is a JS symbol.
    *
    * @type {RegExp}
    */
   static #regexIsSymbol = /\[(?<inner>.*)]/;

   /**
    * Stores the valid reflection kinds when processing DeclarationReflections.
    *
    * @type {Set<ReflectionKind>}
    */
   static #validReflectionKind = new Set([
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
    * @param {ReflectionMaps}                reflectionMap -
    *
    * @param {import('typedoc').Application} app -
    *
    * @param {ProjectReflection}             project -
    */
   static buildReflectionMap(reflectionMap, app, project)
   {
      const urlMappings = new DefaultTheme(app.renderer).getUrls(project);

      /**
       * Creates a top level URL mapping for all main HTML pages.
       *
       * @type {Map<import('typedoc').DeclarationReflection, string>}
       */
      const reflectionUrlMap = new Map(urlMappings.map((mapping) => [mapping.model, mapping.url]));

      /**
       * Builds the rest of the reflection map data and URLs for all reflections.
       *
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
            const { isSymbol, reflectionName, reflectionParts } = this.#getReflectionData(reflection);

            // In the case of processing TS libs often there is an interface defined and a subsequent function by the
            // same name so only update the symbol map if an existing interface doesn't exist.
            const currentValue = reflectionMap.external.get(reflectionName);
            if (!isSymbol && (currentValue === void 0 || currentValue?.kind !== ReflectionKind.Interface))
            {
               reflectionMap.external.set(reflectionName, {
                  doc_url: url,
                  kind: reflection.kind
               });
            }

            reflectionMap.internal.set(reflection, {
               name: reflectionName,
               parents: [],
               parts: reflectionParts,
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
    * @param {import('typedoc').Reflection}  reflection -
    *
    * @returns {{ isSymbol: boolean, reflectionName: string, reflectionParts: string[] }} The fully qualified symbol
    *          data.
    */
   static #getReflectionData(reflection)
   {
      const parts = [];

      while (reflection)
      {
         // Do not include the project reflection.
         if (reflection instanceof ProjectReflection) { break; }

         parts.unshift(reflection.name);
         reflection = reflection.parent;
      }

      const reflectionName = parts.join('.');

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

      return { isSymbol, reflectionName, reflectionParts: parts };
   }
}

class MDNProcessReflectionMap
{
   /**
    * TODO: THIS NEEDS TO BE VETTED! Currently only finding inheritance chains for main interfaces. Must validate
    * functions / other reflection kinds.
    *
    * @param {ProjectReflection} project -
    *
    * @param {import('typedoc').DeclarationReflection}   reflection -
    *
    * @returns {DataReflectionParents} Any parent reflections.
    */
   static #getInheritanceTree(project, reflection)
   {
      const visited = new Set();

      const visit = (reflection) =>
      {
         if (visited.has(reflection)) { return null; }

         visited.add(reflection);

         const parents = [];

         if (reflection.extendedTypes)
         {
            for (const extendedType of reflection.extendedTypes)
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
      };

      return visit(reflection);
   }

   /**
    * @param {ReflectionMaps}    reflectionMap -
    *
    * @param {ProjectReflection} project -
    */
   static processReflectionMap(reflectionMap, project)
   {
      // Resolve inheritance chains.
      for (const reflection of reflectionMap.internal.keys())
      {
         if (reflection instanceof ProjectReflection) { continue; }

         const result = this.#getInheritanceTree(project, reflection);

         if (result.parents.length)
         {
            reflectionMap.internal.get(reflection).parents = result.parents;
         }
      }
   }
}

/**
 * Serializes value to a string escaping it so that it can be set as a web component attribute.
 *
 * @param {*}  value - Value to stringify and escape.
 *
 * @returns {string} Escaped string.
 */
function escapeAttr(value)
{
   return JSON.stringify(value)
   .replace(/</g, "\\u003c")
   .replace(/>/g, "\\u003e")
   .replace(/&/g, "\\u0026")
   .replace(/'/g, "\\u0027")
   .replace(/"/g, "\\u0022");
}

class PageRenderer
{
   /** @type {import('typedoc').Application} */
   #app;

   /** @type {ReflectionMaps} */
   #reflectionMaps;

   /**
    * @param {import('typedoc').Application} app -
    *
    * @param {ReflectionMaps}  reflectionMaps -
    */
   constructor(app, reflectionMaps)
   {
      this.#app = app;
      this.#reflectionMaps = reflectionMaps;

      this.#app.renderer.on(PageEvent.END, this.#handlePageEnd, this);
      this.#app.renderer.once(RendererEvent.END, this.#handleRendererEnd, this);
   }

   /**
    * Adds a script element to load the web component bundle supporting MDN links and compatibility charts.
    *
    * @param {import('cheerio').Cheerio} $ -
    *
    * @param {PageEvent}   page -
    *
    * @returns {Map<string, DataMDNLinks>} The MDN links loaded into global script scope.
    */
   #addScripts($, page)
   {
      // Get asset path to script by counting the number of `/` characters then building the relative path.
      const count = (page.url.match(/\//) ?? []).length;
      const scriptPath = `${'../'.repeat(count)}assets/mdn-web-components.js`;

      const headEl = $('head');

      // Append script to the head element.
      headEl.append($(`<script src="${scriptPath}" type="module" />`));

      // Load all link data into global variable MDNLinks ------------------------------------------------------------

      /**
       * This is where we abuse the static page nature of the default TypeDoc template and load an adhoc script that
       * creates a global variable `MDNLinks` with all the link data for the current page and children. The web
       * components access `globalThis.MDNLinks` and as such we can simply pass the name of the symbol or wrap an
       * existing symbol string in the template with the MDNLinksPopup web component.
       *
       * Since this adhoc script is a normal JS script it loads before the ESM code for web components and is not
       * deferred.
       */

      /**
       * Stores the localized links to this page that are loaded into the global scope at `globalThis.MDNLinks`.
       *
       * @type {Map<string, DataMDNLinks>}
       */
      const mdnLinks = new Map();

      const mainLink = this.#reflectionMaps.internal.get(page.model);

      if (mainLink.hasLinks)
      {
         mdnLinks.set(page.model.name, mainLink.mdnLinks);
      }

      if (Array.isArray(page.model.children))
      {
         for (const child of page.model.children)
         {
            const childLink = this.#reflectionMaps.internal.get(child);
            if (childLink?.hasLinks)
            {
               mdnLinks.set(child.name, childLink.mdnLinks);
            }
         }
      }

      headEl.append($(`<meta name="MDNLinks" data-bcmp="${packAndDeflateB64(mdnLinks)}">`));

      return mdnLinks;
   }

   /**
    * Modifications for every page.
    *
    * @param {import('cheerio').Cheerio}  $ -
    */
   #augmentGlobal($)
   {
   }

   /**
    * Appends mdn-links web component to DMT title header flexbox.
    *
    * @param {import('cheerio').Cheerio}  $ -
    *
    * @param {PageEvent}   page - The main page.
    */
   #augmentTitleLink($, page)
   {
      $('.dmt-title-header-flex').append(`<wc-mdn-links data="${escapeAttr(page.model.name)}" />`);
   }

   /**
    * Augment all member links that are found in `mdnLinks`.
    *
    * @param {import('cheerio').Cheerio}  $ -
    *
    * @param {Map<string, DataMDNLinks>} mdnLinks - The MDN links loaded into global script scope.
    */
   #augmentMemberLinks($, mdnLinks)
   {
      $('.tsd-panel.tsd-member .tsd-anchor-link').each((i, node) =>
      {
         const el = $(node);
         const symbolName = el.find('span').text();
         const mdnLink = mdnLinks.get(symbolName);

         if (mdnLink) { el.append(`<wc-mdn-links data="${escapeAttr(symbolName)}" />`); }
      });
   }

   /**
    * @param {PageEvent}   page -
    */
   #handlePageEnd(page)
   {
      const symbolDataInt = this.#reflectionMaps.internal.get(page.model);

      const $ = load$1(page.contents);

      this.#augmentGlobal($);

      if (symbolDataInt)
      {
         // Append scripts to load web components and adhoc global MDNLinks. The loaded links are returned.
         const mdnLinks = this.#addScripts($, page);

         if (symbolDataInt.hasLinks)
         {
            this.#augmentTitleLink($, page);
            this.#augmentMemberLinks($, mdnLinks);
         }
      }

      page.contents = $.html();
   }

   /**
    * Copy web components bundle to docs output assets directory.
    */
   #handleRendererEnd()
   {
      const outDir = `${this.#app.options.getValue('out')}${path.sep}assets`;
      const localDir = path.dirname(fileURLToPath(import.meta.url));

      this.#app.logger.verbose(`[mdn-links] Copying 'mdn-web-components.js' to output assets directory.`);

      fs.copyFileSync(`${localDir}${path.sep}mdn-web-components.js`, `${outDir}${path.sep}mdn-web-components.js`);
      fs.copyFileSync(`${localDir}${path.sep}mdn-web-components.js.map`,
       `${outDir}${path.sep}mdn-web-components.js.map`);
   }
}

/**
 * Provides resolution for all Typescript lib symbols against the MDN browser compatibility data adding MDN link & spec
 * URLs to the internal and external symbol maps. Additionally, the internal symbol map also links the status and
 * support blocks to be displayed in the generated documentation.
 */
class MDNResolver
{
   /**
    * Traverse inheritance tree and collect parents for each node.
    *
    * @param {DataIntReflectionLink}  startNode - The initial node to process.
    *
    * @returns {DataReflectionParents[]} Returns an array of all parent nodes for the given node.
    */
   static #getParents(startNode)
   {
      if (!startNode?.parents?.length) { return []; }

      const processParents = (node, parents = []) =>
      {
         // Add the current node to the parents array if defined.
         if (node) { parents.push(node); }

         // If the node has parents, recurse into them
         if (node.parents)
         {
            for (const parent of node.parents) { processParents(parent, [...parents]); }
         }

         return parents;
      };

      const results = [];

      if (startNode.parents)
      {
         for (const parent of startNode.parents)
         {
            results.push(...processParents(parent));
         }
      }

      return results;
   }


   /**
    * @param {DataIntReflectionLink}  internalEntry -
    *
    * @param {import('@mdn/browser-compat-data').Identifier} compatIdentifier -
    *
    * @returns {({
    *    mdn_url: string,
    *    spec_url: string,
    *    status: import('@mdn/browser-compat-data').StatusBlock,
    *    support: import('@mdn/browser-compat-data').SupportBlock
    * } | undefined)} Attempts to resolve the symbol name against MDN compatibility data.
    */
   static #getMDNData(internalEntry, compatIdentifier)
   {
      // Start with the top-level javascript category in the compat data.
      let current = compatIdentifier;

      // Traverse the compat data according to the parts of the symbol.
      for (const part of internalEntry.parts)
      {
         if (!current[part]) { current = void 0; break; }

         // Move to the next part.
         current = current[part];
      }

      // TODO: This only handles interfaces currently!
      // Attempt to resolve any inheritedFrom data.
      if (!current && internalEntry.parents.length)
      {
         const parents = this.#getParents(internalEntry);

         for (const parent of parents)
         {
            // Start with the top-level javascript category in the compat data.
            let currentParent = compatIdentifier;

            // Traverse the compat data according to the parts of the symbol.
            for (const part of parent.parts)
            {
               if (!currentParent[part]) { currentParent = void 0; break; }

               // Move to the next part.
               currentParent = currentParent[part];
            }

            if (currentParent)
            {
               current = currentParent;
               break;
            }
         }
      }

      if (!current) { return void 0; }

      // Return the MDN / spec URLs and status / support blocks.
      return {
         mdn_url: current?.__compat?.mdn_url,
         spec_url: current?.__compat?.spec_url,
         status: current?.__compat?.status,
         support: current?.__compat?.support
      };
   }

   /**
    * Tests if a DataExtReflectionLink already has defined MDN data.
    *
    * @param {DataExtReflectionLink} data - Reflection link data to test.
    *
    * @returns {boolean} If the reflection link data has MDN data already defined.
    */
   static #hasMDNCompatData(data)
   {
      return typeof data?.mdn_url === 'string' || typeof data?.spec_url === 'string';
   }

   /**
    * @param {ReflectionMaps} symbolMaps -
    */
   static resolve(symbolMaps)
   {
      for (const internalEntry of symbolMaps.internal.values())
      {
         const mdnJSData = MDNResolver.#getMDNData(internalEntry, browserCompatData.javascript.builtins);

         if (mdnJSData)
         {
            internalEntry.mdnCompat.status = mdnJSData.status;
            internalEntry.mdnCompat.support = mdnJSData.support;
            internalEntry.mdnLinks.mdn_url = mdnJSData.mdn_url;
            internalEntry.mdnLinks.spec_url = mdnJSData.spec_url;

            if (mdnJSData.status || mdnJSData.support) { internalEntry.hasCompat = true; }
            if (mdnJSData.mdn_url || mdnJSData.spec_url) { internalEntry.hasLinks = true; }

            const externalEntry = symbolMaps.external.get(internalEntry.name);
            if (externalEntry && !MDNResolver.#hasMDNCompatData(externalEntry))
            {
               externalEntry.mdn_url = mdnJSData.mdn_url;
               externalEntry.spec_url = mdnJSData.spec_url;
            }

            continue;
         }

         const mdnAPIData = MDNResolver.#getMDNData(internalEntry, browserCompatData.api);

         if (mdnAPIData)
         {
            internalEntry.mdnCompat.status = mdnAPIData.status;
            internalEntry.mdnCompat.support = mdnAPIData.support;
            internalEntry.mdnLinks.mdn_url = mdnAPIData.mdn_url;
            internalEntry.mdnLinks.spec_url = mdnAPIData.spec_url;

            if (mdnAPIData.status || mdnAPIData.support) { internalEntry.hasCompat = true; }
            if (mdnAPIData.mdn_url || mdnAPIData.spec_url) { internalEntry.hasLinks = true; }

            const externalEntry = symbolMaps.external.get(internalEntry.name);
            if (externalEntry && !MDNResolver.#hasMDNCompatData(externalEntry))
            {
               externalEntry.mdn_url = mdnAPIData.mdn_url;
               externalEntry.spec_url = mdnAPIData.spec_url;
            }
         }
      }
   }
}

/**
 * Resolves utility and template literal types to Typescript documentation.
 */
class TSResolver
{
   static #templateLiteralTypes = new Map([
      ['Uppercase', 'uppercasestringtype'],
      ['Lowercase', 'lowercasestringtype'],
      ['Capitalize', 'capitalizestringtype'],
      ['Uncapitalize', 'uncapitalizestringtype']
   ]);

   static #utilityTypes = new Map([
      ['Awaited', 'awaitedtype'],
      ['Partial', 'partialtype'],
      ['Required', 'requiredtype'],
      ['Readonly', 'readonlytype'],
      ['Record', 'recordkeys-type'],
      ['Pick', 'picktype-keys'],
      ['Omit', 'omittype-keys'],
      ['Exclude', 'excludeuniontype-excludedmembers'],
      ['Extract', 'extracttype-union'],
      ['NonNullable', 'nonnullabletype'],
      ['Parameters', 'parameterstype'],
      ['ConstructorParameters', 'constructorparameterstype'],
      ['ReturnType', 'returntypetype'],
      ['InstanceType', 'instancetypetype'],
      ['ThisParameterType', 'thisparametertypetype'],
      ['OmitThisParameter', 'omitthisparametertype'],
      ['ThisType', 'thistypetype']
   ]);

   /**
    * Tests if a DataExtReflectionLink already has defined TS data.
    *
    * @param {DataExtReflectionLink} data - Reflection link data to test.
    *
    * @returns {boolean} Does the reflection link data have a TS url already?
    */
   static #hasTSData(data)
   {
      return typeof data?.ts_url === 'string';
   }

   /**
    * @param {ReflectionMaps} reflectionMaps -
    */
   static resolve(reflectionMaps)
   {
      for (const internalEntry of reflectionMaps.internal.values())
      {
         const templateHash = TSResolver.#templateLiteralTypes.get(internalEntry.name);
         if (templateHash)
         {
            const ts_url = `https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#${templateHash}`;
            internalEntry.mdnLinks.ts_url = ts_url;
            internalEntry.hasLinks = true;

            const externalEntry = reflectionMaps.external.get(internalEntry.name);
            if (externalEntry && !TSResolver.#hasTSData(externalEntry))
            {
               externalEntry.ts_url = ts_url;
            }

            continue;
         }

         const utilHash = TSResolver.#utilityTypes.get(internalEntry.name);
         if (utilHash)
         {
            const ts_url = `https://www.typescriptlang.org/docs/handbook/utility-types.html#${utilHash}`;

            internalEntry.mdnLinks.ts_url = ts_url;
            internalEntry.hasLinks = true;

            const externalEntry = reflectionMaps.external.get(internalEntry.name);
            if (externalEntry && !TSResolver.#hasTSData(externalEntry))
            {
               externalEntry.ts_url = ts_url;
            }
         }
      }
   }
}

/**
 * Provides symbol map generation linking MDN browser compatibility data to generated TS lib docs.
 */
class MDNConverter
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

      this.#mdnDataPath = app.options.getValue('mdnDataPath');

      if (typeof this.#mdnDataPath !== 'string') { throw new TypeError(`'mdnDataPath' option is not a string.`); }

      this.#app.converter.on(Converter.EVENT_RESOLVE_END, this.#handleResolveEnd, this);
   }

   /**
    * @param {import('typedoc').Context}  context -
    */
   #handleResolveEnd(context)
   {
      // Register the PageRenderer in the resolve end callback to ensure that it runs after the theme callbacks.
      new PageRenderer(this.#app, this.#reflectionMaps);

      MDNBuildReflectionMap.buildReflectionMap(this.#reflectionMaps, this.#app, context.project);
      MDNProcessReflectionMap.processReflectionMap(this.#reflectionMaps, context.project);

      MDNResolver.resolve(this.#reflectionMaps);
      TSResolver.resolve(this.#reflectionMaps);

      fs.ensureDirSync(this.#mdnDataPath);

      // Serialize the symbol map as object then save the keys / symbol names separately. Both of these JSON files are
      // used by other plugins.
      fs.writeFileSync(`${this.#mdnDataPath}/reflection-mapping.json`,
       JSON.stringify(Object.fromEntries(this.#reflectionMaps.external)), 'utf-8');

      fs.writeFileSync(`${this.#mdnDataPath}/reflection-names.json`,
       JSON.stringify([...this.#reflectionMaps.external.keys()]), 'utf-8');
   }
}

/**
 * Provides a plugin for Typedoc to link Typescript built-in declaration symbols to MDN and specification documentation.
 * This plugin generates the data consumed for the `ts-links` external plugin.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
function load(app)
{
   new MDNConverter(app);
}

export { load };
//# sourceMappingURL=index.js.map
