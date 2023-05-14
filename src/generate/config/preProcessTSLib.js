/**
 * Pre-processes TS libs to remove copyright and any triple slash references.
 *
 * @param {string}   srcData - TS declaration source
 *
 * @returns {string} Processed declaration.
 */
export function preProcessTSLib(srcData)
{
   // Remove copyright comment blocks.
   srcData = srcData.replaceAll(/\/\*!(.|\n)*?\*\//gm, '');

   // Remove all reference comments.
   srcData = srcData.replaceAll(/\/\/\/ <reference.*\/>/gm, ``);

   return srcData;
}