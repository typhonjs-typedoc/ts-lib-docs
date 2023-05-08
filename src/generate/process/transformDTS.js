import fs   from 'fs-extra';
import ts   from 'typescript'
import {
   Project,
   Node }   from 'ts-morph';

export async function transformDTS()
{
   fs.ensureDirSync('./.doc-gen/transformed');
   fs.emptydirSync('./.doc-gen/transformed')

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

   const sourceFiles = [
      project.addSourceFileAtPath('./.doc-gen/source/lib.decorators.d.ts'),
      project.addSourceFileAtPath('./.doc-gen/source/lib.es5.d.ts'),
      project.addSourceFileAtPath('./.doc-gen/source/lib.es2015.core.d.ts'),
      project.addSourceFileAtPath('./.doc-gen/source/lib.es2022.array.d.ts'),
   ];

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

   let indexData = '';

   indexData += await transformInterfaces(project, interfaceMap);

   fs.writeFileSync('./.doc-gen/transformed/index.d.ts', indexData, 'utf-8');
}

/**
 * @param {import('ts-morph').Project} project -
 *
 * @param {Map<string, import('ts-morph').InterfaceDeclaration>}  interfaceMap -
 *
 * @returns {Promise<string>} Index exports.
 */
async function transformInterfaces(project, interfaceMap)
{
   let indexData = '';

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

      indexData += `export * from './interface-${name}';\n`;

      // Create a new source file.
      const newSourceFile = project.createSourceFile(`./.doc-gen/transformed/interface-${name}.d.ts`);

      // Add the interface to the new source file.
      newSourceFile.addInterface(interfaceNode.getStructure());

      // Save the new source file to disk
      await newSourceFile.save();
   }

   return indexData;
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
