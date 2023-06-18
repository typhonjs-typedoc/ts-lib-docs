import {
   ProjectReflection,
   ReferenceType }      from 'typedoc';

export class MDNProcessReflectionMap
{
   /**
    * TODO: THIS NEEDS TO BE VETTED! Currently only finding inheritance chains for main interfaces. Must validate
    * functions / other reflection kinds.
    *
    * @param {ProjectReflection} project -
    *
    * @param {import('typedoc').DeclarationReflection}   reflection -
    *
    * @returns {DataReflectionParents} Any parent reflections.
    */
   static #getInheritanceTree(project, reflection)
   {
      const visited = new Set();

      const visit = (reflection) =>
      {
         if (visited.has(reflection)) { return null; }

         visited.add(reflection);

         const parents = [];

         if (reflection.extendedTypes)
         {
            for (const extendedType of reflection.extendedTypes)
            {
               if (extendedType instanceof ReferenceType && extendedType._target)
               {
                  let parentReflection = project.getReflectionById(extendedType._target);

                  // Keep resolving if another reference type is returned.
                  while (parentReflection && parentReflection instanceof ReferenceType && parentReflection._target)
                  {
                     parentReflection = project.getReflectionById(extendedType._target);
                  }

                  if (parentReflection)
                  {
                     const parent = visit(parentReflection);
                     if (parent) { parents.push(parent); }
                  }
               }
            }
         }

         return {
            id: reflection.id,
            kind: reflection.kind,
            name: reflection.getFullName(),
            parts: reflection.getFullName().split('.'),
            parents
         };
      };

      return visit(reflection);
   }

   /**
    * @param {ReflectionMaps}    reflectionMap -
    *
    * @param {ProjectReflection} project -
    */
   static processReflectionMap(reflectionMap, project)
   {
      // Resolve inheritance chains.
      for (const reflection of reflectionMap.internal.keys())
      {
         if (reflection instanceof ProjectReflection) { continue; }

         const result = this.#getInheritanceTree(project, reflection);

         if (result.parents.length)
         {
            reflectionMap.internal.get(reflection).parents = result.parents;
         }
      }
   }
}