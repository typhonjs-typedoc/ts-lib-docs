import type { ReflectionKind } from 'typedoc';

/**
 * Defines a documentation symbol mapping with any associated MDN compatibility data links.
 */
export type DataSymbolLinks = {
   /**
    * The partial link to the generated documentation.
    */
   doc_url: string;

   /**
    * The TypeDoc reflection kind.
    */
   kind: ReflectionKind;

   /**
    * Any associated MDN URL.
    */
   mdn_url?: string;

   /**
    * Any associated specification URLs.
    */
   spec_url?: string | string[];

   /**
    * Any associated Typescript documentation URL.
    */
   ts_url?: string;
};

/**
 * Defines the JSON data for the generated documentation URL mappings.
 */
export declare interface DataSymbolMap {
   /**
    * A documentation symbol with link data.
    */
   [name: string]: DataSymbolLinks;
}

export default DataSymbolMap;