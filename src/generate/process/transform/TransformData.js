import {
   ClassDeclaration,
   FunctionDeclaration,
   InterfaceDeclaration,
   ModuleDeclaration,
   ModuleDeclarationKind,
   SyntaxKind,
   TypeAliasDeclaration,
   VariableDeclaration } from 'ts-morph';

export class TransformData
{
   /** @type {Map<string, { node: ClassDeclaration, mergeOverride: boolean }[]>} */
   #classes = new Map();

   /** @type {Map<string, { node: FunctionDeclaration, mergeOverride: boolean }[]>} */
   #functions = new Map();

   /** @type {Map<string, { node: InterfaceDeclaration, mergeOverride: boolean }[]>} */
   #interfaces = new Map();

   /** @type {Map<string, { node: ModuleDeclaration, mergeOverride: boolean }[]>} */
   #namespaces = new Map();

   /** @type {Map<string, { node: TypeAliasDeclaration, mergeOverride: boolean }[]>} */
   #typeAliases = new Map();

   /** @type {Map<string, { node: VariableDeclaration, mergeOverride: boolean }[]>} */
   #variables = new Map();

   /**
    * @param {import('ts-morph').Node} node - Node to track.
    *
    * @param {boolean} [mergeOverride=false] - When merging declarations for this node are the merged / overriding
    *        values?
    *
    * @returns {boolean} Whether Node is added to tracked data to transform.
    */
   addNode(node, mergeOverride = false)
   {
      const symbol = node.getSymbol();

      if (!symbol) { return false; }

      const name = symbol.getName();

      switch (node.getKind())
      {
         case SyntaxKind.ClassDeclaration:
            if (!this.#classes.has(name)) { this.#classes.set(name, [{ node, mergeOverride }]); }
            else { this.#classes.get(name).push({ node, mergeOverride }); }
            return true;

         case SyntaxKind.FunctionDeclaration:
            if (!this.#functions.has(name)) { this.#functions.set(name, [{ node, mergeOverride }]); }
            else { this.#functions.get(name).push({ node, mergeOverride }); }
            return true;

         case SyntaxKind.InterfaceDeclaration:
            if (!this.#interfaces.has(name)) { this.#interfaces.set(name, [{ node, mergeOverride }]); }
            else { this.#interfaces.get(name).push({ node, mergeOverride }); }
            return true;

         case SyntaxKind.ModuleDeclaration:
            if (node.getDeclarationKind() === ModuleDeclarationKind.Namespace)
            {
               if (!this.#namespaces.has(name)) { this.#namespaces.set(name, [{ node, mergeOverride }]); }
               else { this.#namespaces.get(name).push({ node, mergeOverride }); }
               return true;
            }
            else
            {
               return false;
            }

         case SyntaxKind.TypeAliasDeclaration:
            if (!this.#typeAliases.has(name)) { this.#typeAliases.set(name, [{ node, mergeOverride }]); }
            else { this.#typeAliases.get(name).push({ node, mergeOverride }); }
            return true;

         case SyntaxKind.VariableDeclaration:
            if (!this.#variables.has(name)) { this.#variables.set(name, [{ node, mergeOverride }]); }
            else { this.#variables.get(name).push({ node, mergeOverride }); }
            return true;
      }

      return false;
   }

   /**
    * @template T
    *
    * @param {T} kind - The kind of Node to retrieve.
    *
    * @returns {IterableIterator<[string, { node: T, mergeOverride: boolean }[]]>} The entries iterator for the given
    *          Node kind.
    */
   getEntries(kind)
   {
      switch (kind)
      {
         case ClassDeclaration:
            return this.#classes.entries();

         case FunctionDeclaration:
            return this.#functions.entries();

         case InterfaceDeclaration:
            return this.#interfaces.entries();

         case ModuleDeclaration:
            return this.#namespaces.entries();

         case TypeAliasDeclaration:
            return this.#typeAliases.entries();

         case VariableDeclaration:
            return this.#variables.entries();

         default:
            throw new Error(`TransformData.getEntries error; unknown node kind: ${kind}`);
      }
   }

   /**
    * Provides an overview of symbols by name and how many duplicate references are tracked.
    *
    * @returns {string} Tracked data overview.
    */
   toString()
   {
      let result = '';

      const classNames = Array.from(this.#classes.keys()).sort();
      if (classNames.length)
      {
         result += 'Classes:\n';
         for (const name of classNames) { result += `\t${name}: ${this.#classes.get(name).length}\n`; }
      }

      const functionNames = Array.from(this.#functions.keys()).sort();
      if (functionNames.length)
      {
         result += 'Functions:\n';
         for (const name of functionNames) { result += `\t${name}: ${this.#functions.get(name).length}\n`; }
      }

      const interfaceNames = Array.from(this.#interfaces.keys()).sort();
      if (interfaceNames.length)
      {
         result += 'Interfaces:\n';
         for (const name of interfaceNames) { result += `\t${name}: ${this.#interfaces.get(name).length}\n`; }
      }

      const namespaceNames = Array.from(this.#namespaces.keys()).sort();
      if (namespaceNames.length)
      {
         result += 'Namespaces:\n';
         for (const name of namespaceNames) { result += `\t${name}: ${this.#namespaces.get(name).length}\n`; }
      }

      const typeAliasNames = Array.from(this.#typeAliases.keys()).sort();
      if (typeAliasNames.length)
      {
         result += 'Type Aliases:\n';
         for (const name of typeAliasNames) { result += `\t${name}: ${this.#typeAliases.get(name).length}\n`; }
      }

      const variableNames = Array.from(this.#variables.keys()).sort();
      if (variableNames.length)
      {
         result += 'Variables:\n';
         for (const name of variableNames) { result += `\t${name}: ${this.#variables.get(name).length}\n`; }
      }

      return result;
   }
}
