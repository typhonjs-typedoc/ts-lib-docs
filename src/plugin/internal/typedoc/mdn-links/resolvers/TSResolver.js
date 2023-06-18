/**
 * Resolves utility and template literal types to Typescript documentation.
 */
export class TSResolver
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
