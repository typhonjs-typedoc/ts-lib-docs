import fs                  from 'fs-extra';
import path                from 'node:path';
import { fileURLToPath }   from 'node:url';

import {
   PageEvent,
   RendererEvent }         from 'typedoc';

import { load }            from 'cheerio';

import { escapeAttr }      from '../utils.mjs';

export class PageRenderer
{
   /** @type {import('typedoc').Application} */
   #app;

   /**
    * @param {import('typedoc').Application} app -
    */
   constructor(app)
   {
      this.#app = app;

      this.#app.renderer.on(PageEvent.END, this.#handlePageEnd, this);
      this.#app.renderer.once(RendererEvent.END, this.#handleRendererEnd, this);
   }

   /**
    * Adds a script element to load the web component bundle supporting MDN links and compatibility charts.
    *
    * @param {import('cheerio').Cheerio} $ -
    *
    * @param {PageEvent}   page -
    *
    * @returns {Map<string, DataMDNLinks>} The MDN links loaded into global script scope.
    */
   #addScripts($, page)
   {
      // Get asset path to script by counting the number of `/` characters then building the relative path.
      const count = (page.url.match(/\//) ?? []).length;
      const scriptPath = `${'../'.repeat(count)}assets/dmt-web-components.js`;

      const headEl = $('head');

      // Append script to the head element.
      headEl.append($(`<script src="${scriptPath}" type="module" />`));

      // Load all link data into global variable MDNLinks ------------------------------------------------------------
   }

   /**
    * Modifications for every page.
    *
    * @param {import('cheerio').Cheerio}  $ -
    */
   #augmentGlobal($)
   {
      // On load set opacity to 0 on the body as there is a DOMContentLoaded handler in `index.js` that on rAF makes the
      // body visible. This allows the default theme `main.js` to load before display along with the DMT web components.
      $('body').prop('style', 'opacity: 0')

      $('.tsd-navigation.settings').wrap(`<wc-dmt-wrap></wc-dmt-wrap>`);
   }

   /**
    * @param {PageEvent}   page -
    */
   #handlePageEnd(page)
   {
      const $ = load(page.contents);

      // Append scripts to load web components and adhoc global MDNLinks. The loaded links are returned.
      this.#addScripts($, page);

      this.#augmentGlobal($);

      page.contents = $.html();
   }

   /**
    * Copy web components bundle to docs output assets directory.
    */
   #handleRendererEnd()
   {
      const outDir = `${this.#app.options.getValue('out')}${path.sep}assets`;
      const localDir = path.dirname(fileURLToPath(import.meta.url));

      this.#app.logger.verbose(`[dmt-theme] Copying 'dmt-web-components.js' to output assets directory.`);

      fs.copyFileSync(`${localDir}${path.sep}dmt-web-components.js`, `${outDir}${path.sep}dmt-web-components.js`);
      fs.copyFileSync(`${localDir}${path.sep}dmt-web-components.js.map`,
       `${outDir}${path.sep}dmt-web-components.js.map`);
   }
}