import { ProjectReflection, ReflectionKind } from 'typedoc';

/**
 * Provides a plugin to verbosely log any unknown symbols.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
export function load(app)
{
   const emptyArray = [];

   /**
    * Stores the symbols that failed to resolve.
    *
    * @type {Set<string>}
    */
   const failed = new Set();

   /**
    * @param {import('typedoc').Reflection}  reflection -
    *
    * @returns {string} The fully qualified symbol name.
    */
   function getSymbolName(reflection)
   {
      const parts = [];

      while (reflection)
      {
         // Do not include the project reflection.
         if (reflection instanceof ProjectReflection) { break; }

         parts.unshift(reflection.name);
         reflection = reflection.parent;
      }

      return parts.join('.');
   }

   /**
    * @param {import('typedoc').DeclarationReference} ref - Unknown symbol reference.
    *
    * @param {import('typedoc').Reflection}  refl - Source reflection.
    */
   function handleUnknownSymbol(ref, refl)
   {
      if (ref.moduleSource === 'typescript' || (!ref.moduleSource && ref.resolutionStart === 'global'))
      {
         const symbolPath = ref.symbolReference?.path ?? emptyArray;

         const name = symbolPath?.map((path) => path.path).join('.');

         if (!name) { return; }

         if (!failed.has(name))
         {
            failed.add(name);

            app.logger.verbose(`[typedoc-ts-links-checker]: Failed to resolve type: ${name} from ${
             getSymbolName(refl)}; kind: ${ReflectionKind.singularString(refl.kind)}`);
         }
      }
   }

   app.converter.addUnknownSymbolResolver(handleUnknownSymbol);
}

