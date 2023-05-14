import fs               from 'fs-extra';
import {
   DefaultTheme,
   ReflectionKind }     from 'typedoc';

/**
 * @param {import('typedoc').Application} app -
 *
 * @param {import('typedoc').ProjectReflection} project -
 */
export function generateUrlMap(app, project)
{
   const urlMappings = new DefaultTheme(app.renderer).getUrls(project);

   // Collect top level symbol links.
   const symbolLinks = urlMappings.map((urlMapping) =>
   {
      return {
         name: urlMapping.model.name,
         url: urlMapping.url,
      };
   });

   const symbolAnchors = [];

   urlMappings.forEach((urlMapping) =>
   {
      const pageAnchors = collectAnchors(urlMapping.model);
      symbolAnchors.push({
         url: urlMapping.url,
         anchors: pageAnchors,
      });
   });

   // Temporary testing output.
   fs.writeFileSync('./url-mapping.json', JSON.stringify(symbolLinks, null, 2), 'utf-8');
   fs.writeFileSync('./url-mapping-anchors.json', JSON.stringify(symbolAnchors, null, 2), 'utf-8');
}

/**
 *
 * @param {import('typedoc').Reflection}  reflection -
 *
 * @param {string}   prefix -
 *
 * @returns {*[]} -
 */
function collectAnchors(reflection, prefix = '')
{
   const anchors = [];

   if (reflection.kind === ReflectionKind.Class || reflection.kind === ReflectionKind.Interface ||
    reflection.kind === ReflectionKind.Enum || reflection.kind === ReflectionKind.TypeAlias ||
     reflection.kind === ReflectionKind.Namespace)
   {
      prefix = `${reflection.name}.`;
   }

   if (reflection.kind === ReflectionKind.Property || reflection.kind === ReflectionKind.Method ||
    reflection.kind === ReflectionKind.Accessor || reflection.kind === ReflectionKind.Function ||
     reflection.kind === ReflectionKind.EnumMember)
   {
      anchors.push({
         name: `${prefix}${reflection.name}`,
         anchor: `#${reflection.name}`,
      });
   }

   if (reflection.children)
   {
      reflection.children.forEach((child) =>
      {
         anchors.push(...collectAnchors(child, prefix));
      });
   }

   return anchors;
}