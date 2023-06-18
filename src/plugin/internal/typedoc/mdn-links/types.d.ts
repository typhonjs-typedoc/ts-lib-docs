import type {
   StatusBlock,
   SupportBlock }          from '@mdn/browser-compat-data';

import type {
   DeclarationReflection,
   ReflectionKind }        from 'typedoc';

/**
 * Defines the data generated for the external reflection map.
 */
type DataExtReflectionLink = {
   /**
    * The partial link to the generated documentation.
    */
   doc_url: string,

   /**
    * The reflection kind.
    */
   kind: ReflectionKind,

   /**
    * Any associated MDN URL.
    */
   mdn_url?: string,

   /**
    * Any associated specification URLs.
    */
   spec_url?: string | string[],

   /**
    * Any associated Typescript documentation URL.
    */
   ts_url?: string
}

/**
 * Defines the data for the internal reflection map.
 */
type DataIntReflectionLink = {
   /**
    * The fully qualified reflection name.
    */
   name: string,

   /**
    * The separate reflection name parts used in MDN browser compat lookups.
    */
   parts: string[],

   /**
    * An array of parent reflections.
    */
   parents: DataReflectionParents[],

   /**
    * Indicates that there is MDN compatibility data.
    */
   hasCompat: boolean,

   /**
    * Indicates that there is MDN link data.
    */
   hasLinks: boolean,

   /**
    * The MDN compatibility data.
    */
   mdnCompat: DataMDNCompat,

   /**
    * The MDN links data.
    */
   mdnLinks: DataMDNLinks
}

type DataMDNCompat = {
   /**
    * MDN status block.
    */
   status?: StatusBlock,

   /**
    * MDN support block.
    */
   support?: SupportBlock
};

type DataMDNLinks = {
   /**
    * Any associated MDN URL.
    */
   mdn_url?: string,

   /**
    * Any associated specification URLs.
    */
   spec_url?: string | string[],

   /**
    * Any associated Typescript documentation URL.
    */
   ts_url?: string
};

type DataReflectionParents = {
   /**
    * ID of reflection.
    */
   id: number,

   /**
    * Reflection kind.
    */
   kind: ReflectionKind,

   /**
    * Name of reflection.
    */
   name: string,

   /**
    * Individual parts of the reflection name split on `.`.
    */
   parts: string[],

   /**
    * Parent reflections.
    */
   parents: DataReflectionParents[]
}

type ReflectionMaps = {
   /**
    * External data used by other plugins.
    */
   external: Map<string, DataExtReflectionLink>,

   /**
    * Data used internally for `mdn-links` plugin.
    */
   internal: Map<DeclarationReflection, DataIntReflectionLink>
}

export {
   DataExtReflectionLink,
   DataIntReflectionLink,
   DataMDNCompat,
   DataMDNLinks,
   DataReflectionParents,
   ReflectionMaps
};