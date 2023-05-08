import fs   from 'fs-extra';
import ts   from 'typescript'
import {
   Project,
   Node }   from 'ts-morph';

/**
 * @param {{ dom: boolean, esm: boolean, worker: boolean }}   generate -
 *
 * @returns {Promise<void>}
 */
export async function transformDTS(generate)
{
   if (generate.dom) { await transformProject(docsDOM); }
   if (generate.esm) { await transformProject(docsESM); }
   if (generate.worker) { await transformProject(docsWorker); }
}

export async function transformProject(docData)
{
   fs.ensureDirSync(docData.outDir);
   fs.emptydirSync(docData.outDir)

   const project = new Project({
      compilerOptions: {
         target: ts.ScriptTarget.ES2022,
         module: ts.ModuleKind.ES2022,
      }
   });

   /**
    * @type {Map<string, import('ts-morph').InterfaceDeclaration[]>}
    */
   const interfaceMap = new Map();

   const sourceFiles = docData.sourceFiles.map((filepath) => project.addSourceFileAtPath(filepath));

   for (const sourceFile of sourceFiles)
   {
      if (!sourceFile.isDeclarationFile()) { continue; }

      console.log(`Processing: ${sourceFile.getBaseName()}`);

      const exportedDeclarations = sourceFile.getExportedDeclarations();

      for (const [_, declarations] of exportedDeclarations)
      {
         for (const declaration of declarations)
         {
            const symbol = declaration.getSymbol();

            if (!symbol) { continue; }

            const name = symbol.getName();

            // Handle InterfaceDeclaration nodes
            if (Node.isInterfaceDeclaration(declaration))
            {
               if (!interfaceMap.has(name)) { interfaceMap.set(name, [declaration]); }
               else { interfaceMap.get(name).push(declaration); }
            }
         }
      }
   }

   await transformInterfaces(project, interfaceMap, docData.outDir);
}

/**
 * @param {import('ts-morph').Project} project -
 *
 * @param {Map<string, import('ts-morph').InterfaceDeclaration>}  interfaceMap -
 *
 * @returns {Promise<string>} Index exports.
 */
async function transformInterfaces(project, interfaceMap, outDir)
{
   for (const [name, nodes] of interfaceMap.entries())
   {
      const interfaceNode = nodes[0];

      if (nodes.length > 1)
      {
         console.log(`Updating interface: ${name}`);

         const interfaceMembers = interfaceNode.getMembers();

         for (let cntr = 1; cntr < nodes.length; cntr++)
         {
            const copyInterface = nodes[cntr];
            const copyMembers = copyInterface.getMembers();

            for (const copyMember of copyMembers)
            {
               const copyMemberName = copyMember.getSymbol()?.getName();

               if (!copyMemberName) { continue; }

               const targetMember = interfaceMembers.find((member) =>
               {
                  const memberSymbol = member.getSymbol();
                  return memberSymbol && memberSymbol.getName() === copyMemberName
               });

               if (targetMember)
               {
                  console.log(`\treplacing member: ${copyMemberName}`);

                  targetMember.replaceWithText(copyMember.getText());
               }
               else
               {
                  console.log(`\tadding member: ${copyMemberName}`);

                  interfaceNode.addMember(copyMember.getStructure());
               }
            }
         }

         alphabetizeInterfaceMembers(interfaceNode);
      }

      // Create a new source file.
      const newSourceFile = project.createSourceFile(`${outDir}/interface-${name}.d.ts`);

      // Add the interface to the new source file.
      newSourceFile.addInterface(interfaceNode.getStructure());

      // Save the new source file to disk
      await newSourceFile.save();
   }
}

/**
 * @param {import('ts-morph').InterfaceDeclaration}   interfaceNode -
 */
function alphabetizeInterfaceMembers(interfaceNode)
{
   const members = interfaceNode.getMembers();
   const sortedMembers = [...members].sort((a, b) =>
   {
      const aSymbol = a.getSymbol();
      const bSymbol = b.getSymbol();

      if (!aSymbol || !bSymbol) { return 0; }

      const aName = aSymbol.getName();
      const bName = bSymbol.getName();

      return aName.localeCompare(bName);
   });

   const modifiers = interfaceNode.getModifiers().map(modifier => modifier.getText()).join(' ');
   const typeParameters = interfaceNode.getTypeParameters().map(param => param.getText()).join(', ');
   const heritageClauses = interfaceNode.getHeritageClauses().map(clause => clause.getText()).join(' ');

   // Replace the original interface with a new one containing sorted members while preserving the interface
   // signature and comments.
   interfaceNode.replaceWithText(`${modifiers} interface ${interfaceNode.getName()}${typeParameters ? 
    `<${typeParameters}>` : ''} ${heritageClauses ? heritageClauses : ''} {\n${sortedMembers.map(
    (member) => member.getFullText()).join('')}\n}`);
}

const docsDOM = {
   outDir: './.doc-gen/transformed/dom',

   sourceFiles: [
      './.doc-gen/source/lib.dom.d.ts',
      './.doc-gen/source/lib.dom.iterable.d.ts'
   ]
}

const docsESM = {
   outDir: './.doc-gen/transformed/esm',

   sourceFiles: [
      './.doc-gen/source/lib.decorators.d.ts',
      './.doc-gen/source/lib.es5.d.ts',
      './.doc-gen/source/lib.es2015.collection.d.ts',
      './.doc-gen/source/lib.es2015.core.d.ts',
      './.doc-gen/source/lib.es2015.generator.d.ts',
      './.doc-gen/source/lib.es2015.iterable.d.ts',
      './.doc-gen/source/lib.es2015.promise.d.ts',
      './.doc-gen/source/lib.es2015.proxy.d.ts',
      './.doc-gen/source/lib.es2015.reflect.d.ts',
      './.doc-gen/source/lib.es2015.symbol.d.ts',
      './.doc-gen/source/lib.es2015.symbol.wellknown.d.ts',
      './.doc-gen/source/lib.es2016.array.include.d.ts',
      './.doc-gen/source/lib.es2017.intl.d.ts',
      './.doc-gen/source/lib.es2017.object.d.ts',
      './.doc-gen/source/lib.es2017.sharedmemory.d.ts',
      './.doc-gen/source/lib.es2017.string.d.ts',
      './.doc-gen/source/lib.es2017.typedarrays.d.ts',
      './.doc-gen/source/lib.es2018.asyncgenerator.d.ts',
      './.doc-gen/source/lib.es2018.asynciterable.d.ts',
      './.doc-gen/source/lib.es2018.intl.d.ts',
      './.doc-gen/source/lib.es2018.promise.d.ts',
      './.doc-gen/source/lib.es2018.regexp.d.ts',
      './.doc-gen/source/lib.es2019.array.d.ts',
      './.doc-gen/source/lib.es2019.intl.d.ts',
      './.doc-gen/source/lib.es2019.object.d.ts',
      './.doc-gen/source/lib.es2019.string.d.ts',
      './.doc-gen/source/lib.es2019.symbol.d.ts',
      './.doc-gen/source/lib.es2020.bigint.d.ts',
      './.doc-gen/source/lib.es2020.date.d.ts',
      './.doc-gen/source/lib.es2020.intl.d.ts',
      './.doc-gen/source/lib.es2020.number.d.ts',
      './.doc-gen/source/lib.es2020.promise.d.ts',
      './.doc-gen/source/lib.es2020.sharedmemory.d.ts',
      './.doc-gen/source/lib.es2020.string.d.ts',
      './.doc-gen/source/lib.es2020.symbol.wellknown.d.ts',
      './.doc-gen/source/lib.es2021.intl.d.ts',
      './.doc-gen/source/lib.es2021.promise.d.ts',
      './.doc-gen/source/lib.es2021.string.d.ts',
      './.doc-gen/source/lib.es2021.weakref.d.ts',
      './.doc-gen/source/lib.es2022.array.d.ts',
      './.doc-gen/source/lib.es2022.error.d.ts',
      './.doc-gen/source/lib.es2022.intl.d.ts',
      './.doc-gen/source/lib.es2022.object.d.ts',
      './.doc-gen/source/lib.es2022.regexp.d.ts',
      './.doc-gen/source/lib.es2022.sharedmemory.d.ts',
      './.doc-gen/source/lib.es2022.string.d.ts',
      './.doc-gen/source/lib.es2023.array.d.ts'
   ]
}

const docsWorker = {
   outDir: './.doc-gen/transformed/worker',

   sourceFiles: [
      './.doc-gen/source/lib.webworker.d.ts',
      './.doc-gen/source/lib.webworker.importscripts.d.ts',
      './.doc-gen/source/lib.webworker.iterable.d.ts'
   ]
}
