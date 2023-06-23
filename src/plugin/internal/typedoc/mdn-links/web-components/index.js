import './MDNLinks.svelte';

/**
 * Inflate and unpack MDN links data from meta element `MDNLinks`. The DMT theme loads the inflate methods into global
 * scope in order to not duplicate bundling the compression / MessagePack support multiple times.
 */
if (!globalThis.MDNLinks)
{
   try
   {
      const metaMDNLinks = document.querySelector('meta[name="MDNLinks"]');
      globalThis.MDNLinks = globalThis?.dmtInflateAndUnpackB64?.(metaMDNLinks.getAttribute('data-bcmp'));
   }
   catch(err)
   {
      console.warn(`[ts-lib-docs] Failed to inflate and unpack MDN links data.`);
   }
}
