import { Resolver } from './Resolver.mjs';

/**
 * Provides a plugin for Typedoc to link Typescript lib.d.ts symbols to external documentation.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
export function load(app)
{
   new Resolver(app);
}

