<!-- Svelte option to indicate this component is a web component -->
<svelte:options tag=wc-mdn-links />

<script>
   import * as svg         from './assets/index.js';

   import { unescapeAttr } from '../utils.js';

   export let data = void 0;

   let buttons = [];

   $: if (data)
   {
      try
      {
         const unescaped = unescapeAttr(data)

         /** @type {DataMDNLinks} */
         const mdnLinks = globalThis?.MDNLinks?.get(unescaped);

         if (mdnLinks)
         {
            const newButtons = [];

            if (typeof mdnLinks.mdn_url === 'string')
            {
               newButtons.push({ svg: svg.mdn, title: 'MDN Documentation', url: mdnLinks.mdn_url });
            }

            if (typeof mdnLinks.ts_url === 'string')
            {
               newButtons.push({ svg: svg.ts, title: 'TS Documentation', url: mdnLinks.ts_url });
            }

            if (typeof mdnLinks.spec_url === 'string')
            {
               newButtons.push({ svg: svg.spec, title: 'Specification', url: mdnLinks.spec_url });
            }
            else if (Array.isArray(mdnLinks.spec_url))
            {
               for (const entry of mdnLinks.spec_url)
               {
                  newButtons.push({ svg: svg.spec, title: 'Specification', url: entry });
               }
            }

            buttons = newButtons;
            }
      }
      catch (err)
      {
         console.warn(`[mdn-links] Failure to deserialize link data: `, data);
      }
   }
</script>

<div class=container>
   {#each buttons as button}
      <a href={button.url} target=_blank>
         <img alt={button.title} src={button.svg} title={button.title}>
      </a>
   {/each}
</div>

<style>
   .container {
      display: flex;
      align-items: center;
      background: var(--dmt-container-background);
      border-radius: var(--dmt-container-border-radius);
      border: var(--dmt-container-border);
      gap: var(--mdn-link-button-gap);
      padding: var(--mdn-link-container-padding);
      width: fit-content;
      height: fit-content;
   }

   img {
      display: block;
      border-radius: var(--mdn-link-button-border-radius);
      border: var(--dmt-container-border);
      width: var(--mdn-link-button-diameter);
      height: var(--mdn-link-button-diameter);
      opacity: 0.8;
   }

   img:hover {
      opacity: 1;
   }
</style>