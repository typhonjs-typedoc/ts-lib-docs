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
    */
   #addScript($, page)
   {
      // Get asset path to script by counting the number of `/` characters then building the relative path.
      const count = (page.url.match(/\//) ?? []).length;
      const scriptPath = `${'../'.repeat(count)}assets/mdn-web-components.js`;

      // Append script to the head element.
      $('head').append($(`<script src="${scriptPath}" type="module" />`));
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
    * Replaces the main header / title with a flex box element w/ mdn-links web component.
    *
    * @param {import('cheerio').Cheerio}  $ -
    *
    * @param {DataSymbolLinkInternal}     symbolDataInt -
    */
   #augmentTitle($, symbolDataInt)
   {
      $('.col-content').append($(`<wc-mdn-links data="${escapeAttr(symbolDataInt.mdnLinks)}" />`));

      // $('.col-content').replaceWith($(`<wc-mdn-links data="${escapeAttr(symbolDataInt.mdnLinks)}" />`));
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
         this.#addScript($, page);

         if (symbolDataInt.hasLinks) { this.#augmentTitle($, symbolDataInt); }

         // console.log(`!! #handlePageEnd - A - has symbol data - name: ${symbolDataInt.name}; kind: ${page?.model?.kind}; url: ${page?.model?.url}`)

      }
      else
      {
         // console.log(`!! #handlePageEnd - B - NO symbol data - name: ${page?.model?.name}; kind: ${page?.model?.kind}; url: ${page?.model?.url}`)
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