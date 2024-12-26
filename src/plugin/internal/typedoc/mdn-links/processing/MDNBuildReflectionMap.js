import {
   ProjectReflection,
   ReflectionKind }     from 'typedoc';

export class MDNBuildReflectionMap
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
      const urlMappings = app.renderer.theme.getUrls(project);
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
          (parentUrl && reflection.parent ? `#${reflection.name.replace(/\W/g, "_").toLowerCase()}` : '');

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