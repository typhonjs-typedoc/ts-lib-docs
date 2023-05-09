import fs                  from 'fs-extra';
import ts                  from 'typescript';

import {
   InterfaceDeclaration,
   Project,
   VariableDeclaration }   from 'ts-morph';

import { TransformData }   from './TransformData.js';

export class TransformProject
{
   /** @type {DocData} */
   #docData;

   /** @type {Project} */
   #project

   /** @type {TransformData} */
   #transformData;

   /**
    * @param {DocData}  docData - Description of source data to process.
    */
   constructor(docData)
   {
      this.#docData = docData;

      fs.ensureDirSync(docData.outDir);
      fs.emptydirSync(docData.outDir)

      this.#project = new Project({
         compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ES2022,
         }
      });

      this.#transformData = new TransformData();
   }

   async transform()
   {
      const sourceFiles = this.#docData.sourceFiles.map((filepath) => this.#project.addSourceFileAtPath(filepath));

      for (const sourceFile of sourceFiles)
      {
         if (!sourceFile.isDeclarationFile()) { continue; }

         console.log(`Processing: ${sourceFile.getBaseName()}`);

         const exportedDeclarations = sourceFile.getExportedDeclarations();

         for (const [_, declarations] of exportedDeclarations)
         {
            for (const declaration of declarations)
            {
               this.#transformData.addNode(declaration);
            }
         }
      }

      await this.#transformInterfaces();
   }

   /**
    * @param {InterfaceDeclaration}   interfaceNode -
    */
   #sortInterfaceMembers(interfaceNode)
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

   /**
    * @returns {Promise<void>}
    */
   async #transformInterfaces()
   {
      for (const [name, nodes] of this.#transformData.getEntries(InterfaceDeclaration))
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

            this.#sortInterfaceMembers(interfaceNode);
         }

         // Create a new source file.
         const newSourceFile = this.#project.createSourceFile(`${this.#docData.outDir}/interface-${name}.d.ts`);

         // Add the interface to the new source file.
         newSourceFile.addInterface(interfaceNode.getStructure());

         // Save the new source file to disk
         await newSourceFile.save();
      }
   }
}