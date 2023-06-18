import { dom }    from './dom.js';
import { esm }    from './esm.js';
import { worker } from './worker.js';

/**
 * @type {import('../../types.js').GenerateConfig}
 */
export const config = {
   year: 2023,

   entries: [
      esm,
      dom,
      worker
   ]
};


