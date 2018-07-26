export interface ICompilerOptions {
    directory?: string
    compile?: string
    run?: string
    executionTimeout?: number
    variables?: Map<string, string | number | boolean | undefined>
}
