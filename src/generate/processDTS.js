import { getFileList }  from "@typhonjs-utils/file-util";
import fs               from 'fs-extra';
import upath            from 'upath';

/**
 * Processes TRL runtime & standard libraries along with the Svelte library moving DTS files to `.doc-gen`.
 */
export async function processDTS()
{
   fs.emptyDirSync('./.doc-gen');

   await processPackageTypescript();
}

/**
 * Processes all DTS files while copying from the original library to `.doc-gen`. There are two processing steps:
 *
 * 1. All bare references for `declare`, `interface`, `type` `@typhonjs-fvtt/runtime`, `@typhonjs-fvtt/standard`, and `svelte` are replaced with
 *    local `imports` from `package.json`. This links all copied declarations together locally and will link symbols
 *    across packages.
 *
 * Prepends data from `prependPath` to source data writing to `destPath`.
 *
 * @param {string}   srcFilepath - Source file path.
 *
 * @param {string}   destFilepath - Destination file path.
 *
 * @param {string}   libName - The name of the subpath export.
 *
 * @returns {boolean} Wrote file.
 */
function processDTSFile(srcFilepath, destFilepath, libName)
{
   let srcData = fs.readFileSync(srcFilepath, 'utf-8');

   // Prepend header data from local `./prepend` folder.
   const prependFilepath = `./prepend/${libName}.js`;
   if (fs.pathExistsSync(prependFilepath))
   {
      srcData = `${fs.readFileSync(prependFilepath, 'utf-8')}\n\n${srcData}`;
   }

   // Substitute imported declarations to local `imports` from `package.json`.
   srcData = srcData.replaceAll(/^interface/gm, `export interface`);
   srcData = srcData.replaceAll(/^declare/gm, `export declare`);
   srcData = srcData.replaceAll(/^type/gm, `export type`);

   // Remove code that causes further downstream problems.
   // All files have this reference that needs to be removed.
   srcData = srcData.replaceAll(`/// <reference no-default-lib="true"/>`, ``);

   // This replacement only affects `intrinsic` definitions in `lib.es5.d.ts` for Lowercase, Uppercase, Capitalize and
   // Uncapitalize.
   srcData = srcData.replaceAll(/^export.*intrinsic;$/gm, ``);

   // Only write files that have actual data / exports.
   if ((/^export/gm).test(srcData))
   {
      fs.writeFileSync(destFilepath, srcData, 'utf-8');
      return true;
   }

   return false;
}

const skipFilenames = [
   'lib.decorators.legacy',
   'lib.dom',
   'lib.dom.iterable',
   'lib.webworker',
   'lib.webworker.importscripts',
   'lib.webworker.iterable'
]

/**
 * Processes the typescript library declarations.
 */
async function processPackageTypescript()
{
   const filepaths = await getFileList({ dir: './node_modules/typescript/lib', ext: new Set(['.ts'])})

   let indexData = ''

   for (const filepath of filepaths)
   {
      const name = upath.basename(filepath, '.d.ts');
      if (name.startsWith('lib.') && !skipFilenames.includes(name))
      {
         if (processDTSFile(filepath, `./.doc-gen/${name}.d.ts`, name))
         {
            console.log(name);
            indexData += `export * from './${name}';\n`;
         }
      }
   }

   fs.writeFileSync('./.doc-gen/index.d.ts', indexData, 'utf-8');
}
