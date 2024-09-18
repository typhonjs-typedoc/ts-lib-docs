import { dom }    from './dom.js';
import { es }     from './es.js';
import { worker } from './worker.js';

/**
 * @type {import('../../types.js').GenerateConfig}
 */
export const config = {
   year: 2024,

   entries: [
      dom,
      es,
      worker
   ]
};


