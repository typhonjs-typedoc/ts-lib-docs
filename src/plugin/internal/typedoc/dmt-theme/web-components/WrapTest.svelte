<!-- Svelte option to indicate this component is a web component -->
<svelte:options tag=wc-dmt-wrap />

<script>
   import { unescapeAttr } from '../utils.mjs';

   export let data = void 0;

   $: if (data)
   {
      try
      {
         const unescaped = unescapeAttr(data)
      }
      catch (err)
      {
         console.warn(`[dmt-theme] Wrap WC - Failure to deserialize link data: `, data);
      }
   }
</script>

<div class=wrap-test>
  <slot />
</div>

<style>
  div {
     color: red;
  }
</style>