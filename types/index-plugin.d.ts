import * as typedoc from 'typedoc';

/**
 * Provides a plugin for Typedoc to link Foundry VTT global and sript scoped API to Foundry documentation.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
declare function load(app: typedoc.Application): void;

export { load };
