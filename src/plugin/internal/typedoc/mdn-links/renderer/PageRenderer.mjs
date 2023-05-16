import { PageEvent } from 'typedoc';

import { load }      from 'cheerio';

export class PageRenderer
{
   #symbolMaps;

   /**
    * @param {import('typedoc').Application} app -
    *
    * @param {SymbolMaps}  symbolMaps -
    */
   constructor(app, symbolMaps)
   {
      this.#symbolMaps = symbolMaps;

      app.renderer.on(PageEvent.END, this.#handlePageEnd, this);
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
      const scriptPath = `${'../'.repeat(count)}assets/test.js`;

      // Create a new script tag.
      const script = $('<script></script>');
      script.attr('src', scriptPath);
      script.attr('type', 'module');

      // Append it to the head element.
      $('head').append(script);
   }

   /**
    * @param {PageEvent}   page -
    */
   #handlePageEnd(page)
   {
      const symbolDataInt = this.#symbolMaps.internal.get(page.model);

      if (symbolDataInt && page.contents)
      {
         // Load HTML content
         const $ = load(page.contents);

         this.#addScript($, page);

         console.log(`!! #handlePageEnd - A - has symbol data - name: ${symbolDataInt.name}; kind: ${page?.model?.kind}; url: ${page?.model?.url}`)

         page.contents = $.html();
      }
      else
      {
         console.log(`!! #handlePageEnd - B - NO symbol data - name: ${page?.model?.name}; kind: ${page?.model?.kind}; url: ${page?.model?.url}`)
      }
   }
}