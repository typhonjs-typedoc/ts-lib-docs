import fs                     from 'node:fs';
import path                   from 'node:path';
import { fileURLToPath }      from 'node:url';

import { Application }        from 'typedoc';

export class Resolver
{
   /** @type {[]} */
   static #emptyArray = [];

   /** @type {Application} */
   #app;

   /**
    * @type {ResolverOptions}
    */
   #options;

   /**
    * Typedoc version support.
    *
    * @type {{objectReturn: boolean}}
    */
   #supports = {
      objectReturn: false
   };

   /**
    * @type {Map<string, import('../../../../../types/index-json').DataSymbolLinks>}
    */
   #urlMapping;

   /**
    * @param {Application} app - Typedoc application
    *
    * @param {ResolverOptions}   options - Options.
    */
   constructor(app, options)
   {
      const pkgName = '[@typhonjs-typedoc/typedoc/ts-links]';

      if (typeof options !== 'object') { throw new TypeError(`${pkgName} 'options' is not an object.`); }
      if (typeof options?.year !== 'number') { throw new TypeError(`${pkgName} 'options.year' is not a number.`); }
      if (typeof options?.lib !== 'string') { throw new TypeError(`${pkgName} 'options.lib' is not a string.`); }
      if (typeof options?.host !== 'string') { throw new TypeError(`${pkgName} 'options.host' is not a string.`); }

      this.#app = app;
      this.#options = options;

      const dataPath = path.resolve(fileURLToPath(import.meta.url),
       `../../../../../../../../data/${options.year}/${options.lib}/reflection-mapping.json`);

      try
      {
         fs.accessSync(dataPath, fs.constants.R_OK);

         this.#urlMapping = new Map(Object.entries(JSON.parse(fs.readFileSync(dataPath, 'utf-8'))));
      }
      catch (err)
      {
         throw new Error(`${pkgName} Could not open url mapping file at:\n${dataPath}\n${err.message}`);
      }

      const version = Application.VERSION.split(/[.-]/);
      this.#supports.objectReturn = +version[1] > 23 || +version[2] >= 26;

      this.#app.converter.addUnknownSymbolResolver(this.#handleUnknownSymbol.bind(this));
   }

   /**
    * Attempts to resolve unknown symbols against library declarations provided by this module.
    *
    * @param {import('typedoc').DeclarationReference} ref - Declaration reference.
    *
    * @returns {import('typedoc').ExternalResolveResult | void} Resolve result.
    */
   #handleUnknownSymbol(ref)
   {
      if (ref.moduleSource === 'typescript' || (!ref.moduleSource && ref.resolutionStart === 'global'))
      {
         const symbolPath = ref.symbolReference?.path ?? Resolver.#emptyArray;

         const name = symbolPath?.map((path) => path.path).join('.');

         if (!name) { return; }

         const result = this.#urlMapping.get(name)?.doc_url;

         if (this.#supports.objectReturn && result)
         {
            /** @type {import('typedoc').ExternalResolveResult} */
            return {
               target: `${this.#options.host}/${result}`,
               caption: name,
            };
         }

         return result;
      }
   }
}

/**
 * @typedef {object} ResolverOptions
 *
 * @property {number}   year - The generate config year to lookup.
 *
 * @property {string}   lib - The generate config lib to lookup.
 *
 * @property {string}   host - The main URL location of the hosted docs.
 */