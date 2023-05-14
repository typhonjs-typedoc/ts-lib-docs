import type { TypeDocOptions } from 'typedoc';

/**
 * Defines the data structure used to process, transform, and bundle TS declarations.
 *
 * Note: If there are multiple sets of docs being generated the `name` or key in the top level config is used for
 * any temporary folders created in processing and provides the default `docs-<name>` output folder for generated docs.
 */
type GenerateConfig = {
   [name: string]: GenerateConfigEntry;
};

type GenerateConfigEntry = {
   process: Iterable<ProcessConfig>

   transform: TransformConfig,

   typedoc: TypeDocConfig
};

type ProcessConfig = {
   /**
    * An iterable list of source file paths to process and copy to `./.doc-gen/source/<name>/`.
    *
    * You define an entry as an object w/ the `source` filepath and `rename` defined as the new file name.
    */
   filepaths: Iterable<string | { source: string, rename: string }> |
    Promise<Iterable<string | { source: string, rename: string }>>

   /**
    * Optional function or iterable list of functions to provide extra pre-process steps to the source file data before
    * it is processed.
    */
   preProcess?: Iterable<(string) => string>
}

/**
 * Defines data used for transforming / merging one or more typescript declaration.
 */
type TransformConfig = {
   /**
    * Provides an exact order of which source files are to be processed from `./.doc-gen/source/<project name>`.
    */
   filenames: Iterable<string>;

   /**
    * The file names specified are configured to merge & override / replace any existing values previously processed.
    */
   mergeOverride?: Set<string>
}

/**
 * Defines data used to configure TypeDoc generation.
 */
type TypeDocConfig = Partial<TypeDocOptions> & { favicon?: string };

export { GenerateConfig, GenerateConfigEntry, ProcessConfig, TransformConfig, TypeDocConfig };