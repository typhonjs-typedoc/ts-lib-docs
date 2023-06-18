import { MDNConverter } from './MDNConverter.js';

/**
 * Provides a plugin for Typedoc to link Typescript built-in declaration symbols to MDN and specification documentation.
 * This plugin generates the data consumed for the `ts-links` external plugin.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
export function load(app)
{
   new MDNConverter(app);
}

