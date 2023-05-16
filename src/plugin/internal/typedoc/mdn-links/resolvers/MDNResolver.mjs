import browserCompatData from '@mdn/browser-compat-data';

/**
 * Provides resolution for all Typescript lib symbols against the MDN browser compatibility data adding MDN link & spec
 * URLs to the internal and external symbol maps. Additionally, the internal symbol map also links the status and support
 * blocks to be displayed in the generated documentation.
 */
export class MDNResolver
{
   /**
    * @param {DataSymbolLinkInternal}  internalEntry -
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
         if (!current[part]) { return void 0; }

         // Move to the next part.
         current = current[part];
      }

      // Return the MDN / spec URLs and status / support blocks.
      return {
         mdn_url: current?.__compat?.mdn_url,
         spec_url: current?.__compat?.spec_url,
         status: current?.__compat?.status,
         support: current?.__compat?.support
      };
   }

   /**
    * Tests if a DataSymbolLink already has defined MDN data.
    *
    * @param {DataSymbolLink} data - Symbol link data to test.
    *
    * @returns {boolean} If the symbol link data has MDN data already defined.
    */
   static #hasMDNCompatData(data)
   {
      return typeof data?.mdn_url === 'string' || typeof data?.spec_url === 'string' ||
       typeof data?.status === 'object' || typeof data?.support === 'object';
   }

   /**
    * @param {SymbolMaps} symbolMaps -
    */
   static resolve(symbolMaps)
   {
      for (const internalEntry of symbolMaps.internal.values())
      {
         const mdnJSData = MDNResolver.#getMDNData(internalEntry, browserCompatData.javascript.builtins);

         if (mdnJSData)
         {
            internalEntry.mdn_url = mdnJSData.mdn_url;
            internalEntry.spec_url = mdnJSData.spec_url;
            internalEntry.status = mdnJSData.status;
            internalEntry.support = mdnJSData.support;

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
            internalEntry.mdn_url = mdnAPIData.mdn_url;
            internalEntry.spec_url = mdnAPIData.spec_url;
            internalEntry.status = mdnAPIData.status;
            internalEntry.support = mdnAPIData.support;

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