import { typesResolver } from './typesResolver.mjs';

/**
 * An array of all resolvers.
 *
 * @type {(() => string | void)[]}
 */
export const resolvers = [
   typesResolver
];