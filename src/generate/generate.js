import { processDTS }   from './processDTS.js';
import { typedoc }      from './typedoc/typedoc.js';

// Process the TRL runtime & standard libraries along with the Svelte library moving DTS files to `.doc-gen`.
await processDTS();

// Generate TypeDoc documentation from `.doc-gen`.
await typedoc();
