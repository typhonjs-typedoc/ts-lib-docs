import {
   FunctionDeclaration,
   InterfaceDeclaration,
   ModuleDeclaration,
   ModuleDeclarationKind,
   Node,
   SyntaxKind,
   TypeAliasDeclaration,
   VariableDeclaration } from 'ts-morph';

export class TransformData
{
   /** @type {Map<string, FunctionDeclaration[]>} */
   #functions = new Map();

   /** @type {Map<string, InterfaceDeclaration[]>} */
   #interfaces = new Map();

   /** @type {Map<string, ModuleDeclaration[]>} */
   #namespaces = new Map();

   /** @type {Map<string, TypeAliasDeclaration[]>} */
   #typeAliases = new Map();

   /** @type {Map<string, VariableDeclaration[]>} */
   #variables = new Map();

   /**
    * @param {import('ts-morph').Node} node -
    *
    * @returns {boolean}
    */
   addNode(node)
   {
      const symbol = node.getSymbol();

      if (!symbol) { return false; }

      const name = symbol.getName();

      switch(node.getKind())
      {
         case SyntaxKind.FunctionDeclaration:
            if (!this.#functions.has(name)) { this.#functions.set(name, [node]); }
            else { this.#functions.get(name).push(node); }
            return true;

         case SyntaxKind.InterfaceDeclaration:
            if (!this.#interfaces.has(name)) { this.#interfaces.set(name, [node]); }
            else { this.#interfaces.get(name).push(node); }
            return true;

         case SyntaxKind.ModuleDeclaration:
            if (node.getDeclarationKind() === ModuleDeclarationKind.Namespace)
            {
               if (!this.#namespaces.has(name)) { this.#namespaces.set(name, [node]); }
               else { this.#namespaces.get(name).push(node); }
               return true;
            }
            else
            {
               return false;
            }

         case SyntaxKind.TypeAliasDeclaration:
            if (!this.#typeAliases.has(name)) { this.#typeAliases.set(name, [node]); }
            else { this.#typeAliases.get(name).push(node); }
            return true;

         case SyntaxKind.VariableDeclaration:
            if (!this.#variables.has(name)) { this.#variables.set(name, [node]); }
            else { this.#variables.get(name).push(node); }
            return true;
      }

      return false;
   }

   /**
    * @template T=NodeTypes
    *
    * @param {T} kind -
    *
    * @returns {IterableIterator<[string, T]>}
    */
   getEntries(kind)
   {
      switch (kind)
      {
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

/**
 * @typedef {(
 *    FunctionDeclaration |
 *    InterfaceDeclaration |
 *    ModuleDeclaration |
 *    TypeAliasDeclaration |
 *    VariableDeclaration
 * )} NodeTypes
 */