import type { ReflectionKind } from 'typedoc';

export type DataSymbolLink = {
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
export default interface DataSymbolMap {
   /**
    * A documentation symbol with link data.
    */
   [name: string]: DataSymbolLink;
}
