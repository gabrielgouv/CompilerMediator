export class CommandNotDefinedError extends Error {

    constructor(message?: string) {
        super(message)
        Object.setPrototypeOf(this, CommandNotDefinedError.prototype)
    }

}
