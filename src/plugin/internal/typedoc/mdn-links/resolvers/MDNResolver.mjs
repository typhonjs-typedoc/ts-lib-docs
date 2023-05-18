import browserCompatData from '@mdn/browser-compat-data';

/**
 * Provides resolution for all Typescript lib symbols against the MDN browser compatibility data adding MDN link & spec
 * URLs to the internal and external symbol maps. Additionally, the internal symbol map also links the status and support
 * blocks to be displayed in the generated documentation.
 */
export class MDNResolver
{
   /**
    * Traverse inheritance tree and collect parents for each node.
    *
    * @param {DataSymbolParents[]}  [parents] - The array of parent nodes for the current node.
    *
    * @param {DataSymbolParents}    [node] - The current node in the inheritance tree.
    *
    * @returns {DataSymbolParents[]} Returns an array of all parent nodes for the given node.
    */
   #getParents(parents = [], node)
   {
      // Add the current node to the parents array if defined.
      if (node) { parents.push(node); }

      // If the node has parents, recurse into them
      if (node.parents)
      {
         for (const parent of node.parents) { this.#getParents([...parents], parent); }
      }

      return parents;
   }

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
         if (!current[part]) { current = void 0; break; }

         // Move to the next part.
         current = current[part];
      }

      // TODO THIS NEEDS TO BE FIXED! MUST TRAVERSE A TREE.
      // Attempt to resolve any inheritedFrom data.
      if (!current && internalEntry.parents.length)
      {
         for (const parent of internalEntry.parents)
         {
            // Start with the top-level javascript category in the compat data.
            let currentParent = compatIdentifier;

            const parentParts = parent.name.split('.');

            // Traverse the compat data according to the parts of the symbol.
            for (const part of parentParts)
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