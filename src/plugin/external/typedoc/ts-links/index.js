import { Resolver }  from './Resolver.js';

/**
 * Provides a plugin for Typedoc to link Typescript lib.d.ts symbols to external documentation.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
export function load(app)
{
   new Resolver(app, { year: REPLACE_YEAR, lib: REPLACE_LIB, host: REPLACE_HOST }); // eslint-disable-line no-undef
}

