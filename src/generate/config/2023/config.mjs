import { dom }    from './dom.mjs';
import { esm }    from './esm.mjs';
import { worker } from './worker.mjs';

/**
 * @type {import('../../types').GenerateConfig}
 */
export const config = {
   year: 2023,

   entries: [
      esm,
      dom,
      worker
   ]
};


