import {
   InterfaceDeclaration,
   Node,
   VariableDeclaration }   from 'ts-morph';

export class TransformData
{
   /** @type {Map<string, InterfaceDeclaration[]>} */
   #interfaces = new Map();

   /** @type {Map<string, VariableDeclaration[]>} */
   #variables = new Map();

   /**
    *
    * @param {import('ts-morph').ExportedDeclarations} node -
    *
    * @returns {boolean}
    */
   addNode(node)
   {
      const symbol = node.getSymbol();

      if (!symbol) { return false; }

      const name = symbol.getName();

      // Handle InterfaceDeclaration nodes
      if (Node.isInterfaceDeclaration(node))
      {
         if (!this.#interfaces.has(name)) { this.#interfaces.set(name, [node]); }
         else { this.#interfaces.get(name).push(node); }
         return true;
      }
      else if (Node.isVariableDeclaration(node))
      {
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
         case InterfaceDeclaration:
            return this.#interfaces.entries();

         case VariableDeclaration:
            return this.#variables.entries();

         default:
            throw new Error(`TransformData.getEntries error; unknown StructureKind: ${kind}`);
      }
   }
}

/**
 * @typedef {InterfaceDeclaration | VariableDeclaration} NodeTypes
 */