<!-- Svelte option to indicate this component is a web component -->
<svelte:options tag=wc-mdn-links />

<script>
   import * as svg         from './assets/index.mjs';

   import { unescapeAttr } from '../utils.mjs';

   export let data = void 0;

   let buttons = [];

   $: if (data)
   {
      try
      {
         /** @type {DataMDNLinks} */
         const unescaped = unescapeAttr(data)

         const newButtons = [];

         if (typeof unescaped.mdn_url === 'string')
         {
            newButtons.push({ svg: svg.mdn, title: 'MDN Documentation', url: unescaped.mdn_url });
         }

         if (typeof unescaped.ts_url === 'string')
         {
            newButtons.push({ svg: svg.ts, title: 'TS Documentation', url: unescaped.ts_url });
         }

         if (typeof unescaped.spec_url === 'string')
         {
            newButtons.push({ svg: svg.spec, title: 'Specification', url: unescaped.spec_url });
         }
         else if (Array.isArray(unescaped.spec_url))
         {
            for (const entry of unescaped.spec_url)
            {
               newButtons.push({ svg: svg.spec, title: 'Specification', url: entry });
            }
         }

         buttons = newButtons;
      }
      catch (err)
      {
         console.warn(`[mdn-links] Failure to deserialize link data.`);
      }
   }
</script>

<div class=container>
   {#each buttons as button}
      <a href={button.url} target=_blank>
         <img class=button-color alt={button.title} src={button.svg} title={button.title}>
      </a>
   {/each}
</div>

<style>
   .container {
      display: flex;
      align-items: center;
      background: var(--mdn-container-background);
      border-radius: var(--mdn-container-border-radius);
      border: var(--mdn-container-border);
      gap: var(--mdn-link-button-gap);
      padding: var(--mdn-link-container-padding);
      width: fit-content;
      height: fit-content;
   }

   img {
      display: block;
      border-radius: var(--mdn-link-button-border-radius);
      border: var(--mdn-container-border);
      width: var(--mdn-link-button-diameter);
      height: var(--mdn-link-button-diameter);
      opacity: 0.8;
   }

   img:hover {
      opacity: 1;
   }
</style>