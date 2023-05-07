const symbolMap = new Map([
]);

/**
 * @param {string} name - Symbol to resolve.
 *
 * @returns {string | void} Resolve result.
 */
export function typesResolver(name)
{
   return symbolMap.get(name);
}