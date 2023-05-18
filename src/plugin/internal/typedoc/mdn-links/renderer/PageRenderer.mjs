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

   /** @type {SymbolMaps} */
   #symbolMaps;

   /**
    * @param {import('typedoc').Application} app -
    *
    * @param {SymbolMaps}  symbolMaps -
    */
   constructor(app, symbolMaps)
   {
      this.#app = app;
      this.#symbolMaps = symbolMaps;

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
      const scriptPath = `${'../'.repeat(count)}assets/mdn-web-components.js`;

      const headEl = $('head');

      // Append script to the head element.
      headEl.append($(`<script src="${scriptPath}" type="module" />`));

      // Load all link data into global variable MDNLinks ------------------------------------------------------------

      /**
       * This is where we abuse the static page nature of the default TypeDoc template and load an adhoc script that
       * creates a global variable `MDNLinks` with all the link data for the current page and children. The web
       * components access `globalThis.MDNLinks` and as such we can simply pass the name of the symbol or wrap an
       * existing symbol string in the template with the MDNLinksPopup web component.
       *
       * Since this adhoc script is a normal JS script it loads before the ESM code for web components and is not
       * deferred.
       */

      /**
       * Stores the localized links to this page that are loaded into the global scope at `globalThis.MDNLinks`.
       *
       * @type {Map<string, DataMDNLinks>}
       */
      const mdnLinks = new Map();

      const mainLink = this.#symbolMaps.internal.get(page.model);

      if (mainLink.hasLinks)
      {
         mdnLinks.set(page.model.name, mainLink.mdnLinks);
      }

      if (Array.isArray(page.model.children))
      {
         for (const child of page.model.children)
         {
            const childLink = this.#symbolMaps.internal.get(child);
            if (childLink?.hasLinks)
            {
               mdnLinks.set(child.name, childLink.mdnLinks);
            }
         }
      }

      headEl.append($(`<script type="application/javascript">window.MDNLinks = new Map(${
       JSON.stringify([...mdnLinks])})</script>`))

      return mdnLinks;
   }

   /**
    * Modifications for every page.
    *
    * @param {import('cheerio').Cheerio}  $ -
    */
   #augmentGlobal($)
   {
      // Remove `Protected`, `Private`, and `External` from member visibility settings.
      $('#tsd-filter-options li').each(function()
      {
         const el = $(this);
         if (!el.find('input[name=inherited]').length) { el.remove(); }
      });
   }

   /**
    * Replaces the main header / title with a flex box element w/ mdn-links web component. `mdn-title-layout` uses
    * a container query to resize the header font size.
    *
    * @param {import('cheerio').Cheerio}  $ -
    *
    * @param {PageEvent}   page - The main page.
    */
   #augmentTitleLink($, page)
   {
      $('.tsd-page-title h1').wrap('<div class="mdn-title-layout"></div>').after(
       `<wc-mdn-links data="${escapeAttr(page.model.name)}" />`);
   }

   /**
    * Augment all member links that are found in `mdnLinks`.
    *
    * @param {import('cheerio').Cheerio}  $ -
    *
    * @param {Map<string, DataMDNLinks>} mdnLinks - The MDN links loaded into global script scope.
    */
   #augmentMemberLinks($, mdnLinks)
   {
      $('.tsd-panel.tsd-member .tsd-anchor-link').each((i, node) =>
      {
         const el = $(node);
         const symbolName = el.find('span').text();
         const mdnLink = mdnLinks.get(symbolName);

         if (mdnLink) { el.append(`<wc-mdn-links data="${escapeAttr(symbolName)}" />`) }
      });
   }

   /**
    * @param {PageEvent}   page -
    */
   #handlePageEnd(page)
   {
      const symbolDataInt = this.#symbolMaps.internal.get(page.model);

      const $ = load(page.contents);

      this.#augmentGlobal($);

      if (symbolDataInt)
      {
         // Append scripts to load web components and adhoc global MDNLinks. The loaded links are returned.
         const mdnLinks = this.#addScripts($, page);

         if (symbolDataInt.hasLinks)
         {
            this.#augmentTitleLink($, page);
            this.#augmentMemberLinks($, mdnLinks);
         }
      }

      page.contents = $.html();
   }

   /**
    * Copy web components bundle to docs output assets directory.
    */
   #handleRendererEnd()
   {
      const outDir = `${this.#app.options.getValue('out')}${path.sep}assets`;
      const localDir = path.dirname(fileURLToPath(import.meta.url));

      this.#app.logger.verbose(`[mdn-links] Copying 'mdn-web-components.js' to output assets directory.`);

      fs.copyFileSync(`${localDir}${path.sep}mdn-web-components.js`, `${outDir}${path.sep}mdn-web-components.js`);
      fs.copyFileSync(`${localDir}${path.sep}mdn-web-components.js.map`,
       `${outDir}${path.sep}mdn-web-components.js.map`);
   }
}