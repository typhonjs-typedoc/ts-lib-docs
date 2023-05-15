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
    * Tests if a DataSymbolLink already has defined TS data.
    *
    * @param {DataSymbolLink} data -
    */
   static #hasTSData(data)
   {
      return typeof data?.ts_url === 'string';
   }

   /**
    * @param {Map<import('typedoc').Reflection, DataSymbolLinkInternal>} symbolMapInternal -
    *
    * @param {Map<string, DataSymbolLink>} symbolMapExternal -
    */
   static resolve(symbolMapInternal, symbolMapExternal)
   {
      for (const internalEntry of symbolMapInternal.values())
      {
         const templateHash = TSResolver.#templateLiteralTypes.get(internalEntry.name);
         if (templateHash)
         {
            const ts_url = `https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#${templateHash}`;
            internalEntry.ts_url = ts_url;

            const externalEntry = symbolMapExternal.get(internalEntry.name);
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

            internalEntry.ts_url = ts_url;

            const externalEntry = symbolMapExternal.get(internalEntry.name);
            if (externalEntry && !TSResolver.#hasTSData(externalEntry))
            {
               externalEntry.ts_url = ts_url;
            }
         }
      }
   }
}
