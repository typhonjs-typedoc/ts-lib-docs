import fs                     from 'fs-extra';
import ts                     from 'typescript';

import {
   FunctionDeclaration,
   InterfaceDeclaration,
   ModuleDeclaration,
   Project,
   SyntaxKind,
   TypeAliasDeclaration,
   VariableDeclaration,
   VariableDeclarationKind }  from 'ts-morph';

import { TransformData }      from './TransformData.js';

export class TransformProject
{
   /** @type {import('../../types.js').TransformConfig} */
   #transformConfig;

   /** @type {string} */
   #outDir;

   /** @type {Project} */
   #project;

   /** @type {string} */
   #sourceDir;

   /** @type {TransformData} */
   #transformData;

   /**
    * @param {import('../../types.js').GenerateConfigEntry}  configEntry - Description of source data to process.
    *
    * @param {number}   year - Year of the config.
    */
   constructor(configEntry, year)
   {
      this.#transformConfig = configEntry.transform;
      this.#sourceDir = `./.doc-gen/source/${year}/${configEntry.name}`;
      this.#outDir = `./.doc-gen/transformed/${year}/${configEntry.name}`;

      fs.ensureDirSync(this.#outDir);
      fs.emptydirSync(this.#outDir);

      this.#project = new Project({
         compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ES2022,
         }
      });

      this.#transformData = new TransformData();
   }

   /**
    * A helper to detect a lowercase starting letter in a string. Supports OSes like Windows where multiple files can
    * conflict with same name and variations of lower / upper case.
    *
    * @param {string}   value - Value to check.
    *
    * @returns {boolean} Is lowercase.
    */
   #isLowerCase(value)
   {
      const firstLetter = value[0];
      return firstLetter === firstLetter.toLowerCase();
   }

   /**
    * Initiates transforming the processed source TS lib declarations outputting combined individual declarations files
    * for each symbol in the respective `./.doc-gen/transformed/<XXX>` folder.
    *
    * @returns {Promise<void>}
    */
   async transform()
   {
      // Provide a specific order to traverse the source files specified as ts-morph will sort the project files.
      for (const filename of this.#transformConfig.filenames)
      {
         const projectSourceFile = this.#project.addSourceFileAtPath(`${this.#sourceDir}/${filename}`);

         if (!projectSourceFile.isDeclarationFile()) { continue; }

         console.log(`Processing: ${projectSourceFile.getBaseName()}`);

         const mergeOverride = this.#transformConfig?.mergeOverride?.has(projectSourceFile.getBaseName()) ?? false;

         const exportedDeclarations = projectSourceFile.getExportedDeclarations();

         for (const [_, declarations] of exportedDeclarations) // eslint-disable-line no-unused-vars
         {
            for (const declaration of declarations) { this.#transformData.addNode(declaration, mergeOverride); }
         }
      }

      await this.#transformFunctions();
      await this.#transformInterfaces();
      await this.#transformNamespaces();
      await this.#transformTypeAliases();
      await this.#transformVariables();
   }

   /**
    * Merges two InterfaceDeclaration from target into source.
    *
    * @param {InterfaceDeclaration} sourceNode - Source interface.
    *
    * @param {InterfaceDeclaration} targetNode - Target interface to merge.
    *
    * @param {object}               [options] - Options.
    *
    * @param {string}               [options.indent='\t'] - Indent string to prepend.
    *
    * @param {boolean}              [options.mergeOverride=false] - Override duplicate members.
    */
   #mergeInterfaces(sourceNode, targetNode, { indent = '\t', mergeOverride = false } = {})
   {
      const targetMembers = targetNode.getMembers();

      for (const targetMember of targetMembers)
      {
         const targetMemberName = targetMember.getSymbol()?.getName();
         if (!targetMemberName) { continue; }

         if (mergeOverride)
         {
            const sourceMembers = sourceNode.getMembers();
            const sourceMember = sourceMembers.find((member) => member.getSymbol()?.getName() === targetMemberName);

            if (!sourceMember)
            {
               console.log(`${indent}adding member: ${targetMemberName}`);
               sourceNode.addMember(targetMember.getStructure());
            }
            else
            {
               console.log(`${indent}replacing member: ${targetMemberName}`);
               sourceMember.remove();
               sourceNode.addMember(targetMember.getStructure());
            }
         }
         else
         {
            console.log(`${indent}adding member: ${targetMemberName}`);
            sourceNode.addMember(targetMember.getStructure());
         }
      }
   }

   /**
    * Merges a source and target namespace / ModuleDeclaration adding or replacing interfaces, types, and variables.
    *
    * @param {ModuleDeclaration} sourceNode - Source namespace node.
    *
    * @param {ModuleDeclaration} targetNode - Target namespace node to merge into source.
    */
   #mergeNamespaces(sourceNode, targetNode)
   {
      const targetInterfaces = targetNode.getInterfaces();
      for (const targetInterface of targetInterfaces)
      {
         const targetInterfaceName = targetInterface.getSymbol()?.getName();
         if (!targetInterfaceName) { continue; }

         const sourceInterface = sourceNode.getInterface(targetInterfaceName);
         if (!sourceInterface)
         {
            console.log(`\tadding interface: ${targetInterfaceName}`);
            sourceNode.addInterface(targetInterface.getStructure());
         }
         else
         {
            // Always merge override Namespace interfaces.
            console.log(`\tmerging interface: ${targetInterfaceName}`);
            this.#mergeInterfaces(sourceInterface, targetInterface, { indent: '\t\t', mergeOverride: true });
         }
      }

      const targetTypeAliases = targetNode.getTypeAliases();
      for (const targetTypeAlias of targetTypeAliases)
      {
         const targetTypeAliasName = targetTypeAlias.getSymbol()?.getName();
         if (!targetTypeAliasName) { continue; }

         const sourceTypeAlias = sourceNode.getTypeAlias(targetTypeAliasName);

         if (!sourceTypeAlias)
         {
            console.log(`\tadding type alias: ${targetTypeAliasName}`);
            sourceNode.addTypeAlias(targetTypeAlias.getStructure());
         }
         else
         {
            console.log(`\treplacing type alias: ${targetTypeAliasName}`);
            sourceTypeAlias.set(targetTypeAlias.getStructure());
         }
      }

      const targetVariableDeclarations = targetNode.getVariableDeclarations();
      for (const targetVariableDeclaration of targetVariableDeclarations)
      {
         const targetVariableDeclarationName = targetVariableDeclaration.getSymbol()?.getName();
         if (!targetVariableDeclarationName) { continue; }

         const sourceVariableDeclaration = sourceNode.getVariableDeclaration(targetVariableDeclarationName);

         if (!sourceVariableDeclaration)
         {
            // Create a VariableStatement and add the VariableDeclaration to it.
            const variableStatementStructure = {
               declarationKind: VariableDeclarationKind.Const,
               declarations: [targetVariableDeclaration.getStructure()],
            };

            console.log(`\tadding variable: ${targetVariableDeclarationName}`);
            sourceNode.addVariableStatement(variableStatementStructure);
         }
         else
         {
            console.log(`\treplacing variable: ${targetVariableDeclarationName}`);
            sourceVariableDeclaration.set(targetVariableDeclaration.getStructure());
         }
      }

      const targetVariablesStatements = targetNode.getVariableStatements();
      for (const targetVariableStatement of targetVariablesStatements)
      {
         const targetVariableStatementName = targetVariableStatement.getSymbol()?.getName();
         if (!targetVariableStatementName) { continue; }

         const sourceVariableStatement = sourceNode.getVariableStatement(targetVariableStatementName);

         if (!sourceVariableStatement)
         {
            console.log(`\tadding variable: ${targetVariableStatementName}`);
            sourceNode.addVariableStatement(targetVariableStatement.getStructure());
         }
         else
         {
            console.log(`\treplacing variable: ${targetVariableStatementName}`);
            sourceVariableStatement.set(targetVariableStatement.getStructure());
         }
      }
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

      const modifiers = interfaceNode.getModifiers().map((modifier) => modifier.getText()).join(' ');
      const typeParameters = interfaceNode.getTypeParameters().map((param) => param.getText()).join(', ');
      const heritageClauses = interfaceNode.getHeritageClauses().map((clause) => clause.getText()).join(' ');

      // Replace the original interface with a new one containing sorted members while preserving the interface
      // signature and comments.
      interfaceNode.replaceWithText(`${modifiers} interface ${interfaceNode.getName()}${typeParameters ?
       `<${typeParameters}>` : ''} ${heritageClauses ? heritageClauses : ''} {\n${sortedMembers.map(
        (member) => member.getFullText()).join('')}\n}`);
   }

   /**
    * There may be one or more functions with different parameters, so output all functions.
    *
    * @returns {Promise<void>}
    */
   async #transformFunctions()
   {
      for (const [name, nodes] of this.#transformData.getEntries(FunctionDeclaration))
      {
         // Create a new source file.
         const newSourceFile = this.#project.createSourceFile(`${this.#outDir}/function-${name}.d.ts`);

         // Add functions to the new source file.
         for (const nodeEntry of nodes)
         {
            newSourceFile.addFunction(nodeEntry.node.getStructure());
         }

         // Save the new source file to disk
         await newSourceFile.save();
      }
   }

   /**
    * Transforms each interface tracked by name either adding new methods declarations.
    *
    * @returns {Promise<void>}
    */
   async #transformInterfaces()
   {
      for (const [name, nodes] of this.#transformData.getEntries(InterfaceDeclaration))
      {
         const interfaceNode = nodes[0].node;

         if (nodes.length > 1)
         {
            console.log(`Updating interface: ${name}`);

            for (let cntr = 1; cntr < nodes.length; cntr++)
            {
               const nodeEntry = nodes[cntr];
               this.#mergeInterfaces(interfaceNode, nodeEntry.node, { mergeOverride: nodeEntry.mergeOverride });
            }

            this.#sortInterfaceMembers(interfaceNode);
         }

         // Create a new source file.
         const newSourceFile = this.#project.createSourceFile(`${this.#outDir}/interface-${name}.d.ts`);

         // Add the interface to the new source file.
         newSourceFile.addInterface(interfaceNode.getStructure());

         // Save the new source file to disk
         await newSourceFile.save();
      }
   }

   /**
    * Transforms each namespace tracked by name either adding new methods or replacing method declarations with updated
    * signatures.
    *
    * @returns {Promise<void>}
    */
   async #transformNamespaces()
   {
      for (const [name, nodes] of this.#transformData.getEntries(ModuleDeclaration))
      {
         const namespaceNode = nodes[0].node;

         if (nodes.length > 1)
         {
            console.log(`Updating namespace: ${name}`);

            for (let cntr = 1; cntr < nodes.length; cntr++)
            {
               const nodeEntry = nodes[cntr];

               // Note: when merging namespaces interfaces always merge override.
               this.#mergeNamespaces(namespaceNode, nodeEntry.node);
            }
         }

         // Create a new source file.
         const newSourceFile = this.#project.createSourceFile(`${this.#outDir}/namespace-${name}.d.ts`);

         // Add the interface to the new source file.
         newSourceFile.addModule(namespaceNode.getStructure());

         // Save the new source file to disk
         await newSourceFile.save();
      }
   }

   /**
    * There may be one or more functions with different parameters, so output all functions.
    *
    * @returns {Promise<void>}
    */
   async #transformTypeAliases()
   {
      for (const [name, nodes] of this.#transformData.getEntries(TypeAliasDeclaration))
      {
         // Create a new source file.
         const newSourceFile = this.#project.createSourceFile(`${this.#outDir}/typealias-${name}.d.ts`);

         // Add functions to the new source file.
         for (const nodeEntry of nodes)
         {
            newSourceFile.addTypeAlias(nodeEntry.node.getStructure());
         }

         // Save the new source file to disk
         await newSourceFile.save();
      }
   }

   /**
    * Transforms each variable tracked by name simply using the last defined Node as variables redefined will overwrite
    * previous declarations. It should be noted that in general there are no redefinitions of variables, but this case
    * is handled nonetheless.
    *
    * @returns {Promise<void>}
    */
   async #transformVariables()
   {
      for (const [name, nodes] of this.#transformData.getEntries(VariableDeclaration))
      {
         /** @type {VariableDeclaration} */
         let variableNode = nodes[0].node;

         if (nodes.length > 1)
         {
            console.log(`Updating variable: ${name}`);
            variableNode = nodes[nodes.length - 1].node;
         }

         // Get the parent VariableDeclarationList node.
         const variableDeclarationList = variableNode.getParentIfKind(SyntaxKind.VariableDeclarationList);

         // Get the parent VariableStatement node.
         const variableStatement = variableDeclarationList?.getParentIfKind(SyntaxKind.VariableStatement);

         if (variableStatement)
         {
            const adjustedName = this.#isLowerCase(name) ? `___${name}` : name;

            // Create a new source file.
            const newSourceFile = this.#project.createSourceFile(`${this.#outDir}/variable-${adjustedName}.d.ts`);

            newSourceFile.addVariableStatement(variableStatement.getStructure());

            // Save the new source file.
            await newSourceFile.save();
         }
         else
         {
            console.log(`Could not find parent variable statement for: ${name}`);
         }
      }
   }
}