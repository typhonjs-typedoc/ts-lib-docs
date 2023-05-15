import fs            from 'node:fs';

import {
   Converter,
   DefaultTheme,
   ProjectReflection,
   ReflectionKind
} from 'typedoc';

export class MDNConverter
{
   /** @type {import('typedoc').Application} */
   #app;

   #regexIsSymbol = /\[(?<inner>.*)]/;

   /** @type {Map<string, DataSymbolLink>} */
   #symbolMapExternal = new Map();

   /** @type {Map<import('typedoc').Reflection, DataSymbolLinkInternal>} */
   #symbolMapInternal = new Map();

   /**
    * Stores the valid reflection kinds when processing DeclarationReflections.
    *
    * @type {Set<ReflectionKind>}
    */
   #validReflectionKind = new Set([
      ReflectionKind.Class,
      ReflectionKind.Interface,
      ReflectionKind.Enum,
      ReflectionKind.TypeAlias,
      ReflectionKind.Function,
      ReflectionKind.Method,
      ReflectionKind.Property,
      ReflectionKind.GetSignature,
      ReflectionKind.SetSignature,
      ReflectionKind.CallSignature,
      ReflectionKind.ConstructorSignature,
      ReflectionKind.IndexSignature,
      ReflectionKind.Constructor
   ]);

   /**
    * @param {import('typedoc').Application} app - Typedoc application
    */
   constructor(app)
   {
      this.#app = app;

      this.#app.converter.on(Converter.EVENT_RESOLVE_END, this.#handleResolveEnd.bind(this));
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
          (parentUrl && reflection.parent ? '#' + reflection.getAlias() : '');

         if (this.#validReflectionKind.has(reflection.kind))
         {
            const { isSymbol, symbolName, symbolParts } = this.#getSymbolData(reflection);

            // In the case of processing TS libs often there is an interface defined and a subsequent function by the
            // same name so only update the symbol map if an existing interface doesn't exist.
            const currentValue = this.#symbolMapExternal.get(symbolName);
            if (!isSymbol && (currentValue === void 0 || currentValue?.kind !== ReflectionKind.Interface))
            {
               this.#symbolMapExternal.set(symbolName, {
                  docLink: url,
                  kind: reflection.kind
               });
            }

            this.#symbolMapInternal.set(reflection, {
               name: symbolName,
               parts: symbolParts
            })
         }

         if (reflection.children)
         {
            for (const child of reflection.children) { visit(child, reflectionUrl ? reflectionUrl : url); }
         }
      }

      visit(project);
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
      const reflectionUrlMap = new Map(urlMappings.map(mapping => [mapping.model, mapping.url]));

      this.#buildSymbolMap(context.project, reflectionUrlMap);

      fs.writeFileSync('./url-mapping.json', JSON.stringify(Object.fromEntries(this.#symbolMapExternal), null, 2),
       'utf-8');
   }
}

/**
 * @typedef {object} DataSymbolLink
 *
 * @property {string}   docLink The partial link to the generated documentation.
 *
 * @property {number}   kind The reflection kind.
 *
 * @property {string}   [mdnLink] Any associated MDN link.
 *
 * @property {string}   [specLink] Any associated specification link.
 *
 * @property {string}   [tsLink] Any associated Typescript documentation link.
 */

/**
 * @typedef {object} DataSymbolLinkInternal
 *
 * @property {string}   name The fully qualified symbol name.
 *
 * @property {string[]} parts The separate symbol name parts used in MDN browser compat lookups.
 *
 * @property {string}   [mdnLink] Any associated MDN link.
 *
 * @property {string}   [specLink] Any associated specification link.
 *
 * @property {string}   [tsLink] Any associated Typescript documentation link.
 */