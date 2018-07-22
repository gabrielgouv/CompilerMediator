export class CommandBuilder {

    private variables = new Map<string, string | number | boolean | undefined>()

    constructor(private command: string) {

    }

    /**
     * Puts a new single variable in variables map.
     * @param name - Variable name.
     * @param value - Variable value.
     */
    public set(name: string, value: string | number | boolean | undefined): CommandBuilder {
        value = typeof value !== 'undefined' ? value : ''
        this.variables.set(name, value)
        return this
    }

    /**
     * Merges a new whole map of variables in variables map.
     * @param variables - Map of variables.
     */
    public setMap(variables: Map<string, string | number | boolean | undefined>): CommandBuilder {
        this.variables = new Map([...this.variables, ...variables])
        return this
    }

    /**
     * Returns the command string with all variables replaced by it respective values.
     * If the command string has variables that are not in variables map they will not replaced.
     */
    public buildAsString(): string {
        this.configureVariables()
        return this.command
    }

    /**
     * Returns the command object with all variables replaced by it respective values.
     * If the command string has variables that are not in variables map they will not replaced.
     */
    public build(): CommandBuilder {
        this.configureVariables()
        return this
    }

    /**
     * Replaces all occurrences of variable names with their respective values using regular expression.
     * If the value of variable is undefined it will be replaced by an empty string.
     */
    private configureVariables(): void {
        for (const [name, value] of this.variables.entries()) {
            this.command = this.command.replace(new RegExp(`\\{${name}\\}`, 'g'), value ? value.toString() : '')
        }
    }

}
