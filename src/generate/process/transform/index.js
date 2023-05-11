export * from './TransformProject.js';

/**
 * @typedef {object} DocData
 *
 * @property {string}   outDir The output directory.
 *
 * @property {string[]} sourceFiles The source TS declarations to process.
 *
 * @property {Set<string>} [mergeOverride] The source TS declarations files that must merge & override existing values.
 */