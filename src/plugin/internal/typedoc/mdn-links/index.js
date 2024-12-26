import { MDNConverter }    from './MDNConverter.js';

import { ParameterType }   from 'typedoc';

/**
 * Provides a plugin for Typedoc to link Typescript built-in declaration symbols to MDN and specification documentation.
 * This plugin generates the data consumed for the `ts-links` external plugin.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
export function load(app)
{
   // Add option to pass the config year to plugins.
   app.options.addDeclaration({
      name: 'mdnDataPath',
      help: 'This is output path for the internal mdn-links plugin.',
      type: ParameterType.String,
      defaultValue: null,
      validate: (value) =>
      {
         if (typeof value !== 'string') { throw new TypeError(`'mdnDataPath' option is not a string.`); }
      }
   });

   new MDNConverter(app);
}

