import { Process, IProcessOutput, ReturnType } from '../runtime/process'
import { ICompilerOptions } from './compiler-options'
import { CommandBuilder } from './command-builder'
import { Observable, Observer } from 'rxjs'
import { completeObserver } from '../utils/rxjs-util'

export class Compiler {

    private options: ICompilerOptions
    private inputs!: string[]

    constructor(options?: ICompilerOptions) {
        this.options = options || {}
    }

    public directory(directory: string): Compiler {
        this.options.directory = directory
        return this
    }

    public compileCommand(command: string): Compiler {
        this.options.compile = this.commandParser(command)
        return this
    }

    public runCommand(command: string): Compiler {
        this.options.run = this.commandParser(command)
        return this
    }

    public putVariable(name: string, value: string | number | boolean): Compiler {
        this.options.variables = this.options.variables ? this.options.variables : new Map()
        if (name.trim().length > 0) {
            this.options.variables.set(name.trim(), value.toString())
        }
        return this
    }

    public writeInputWhenRequested(...inputs: string[]): Compiler {
        this.inputs = inputs
        return this
    }

    public executionTimeout(timeout: number): Compiler {
        this.options.executionTimeout = timeout
        return this
    }

    public execute(callback?: (output: IProcessOutput) => void): Compiler {
        this.compileAndRun().subscribe((output) => {
            if (callback) {
                callback(output)
            }
        })
        return this
    }

    private compileAndRun(): Observable<IProcessOutput> {
        return Observable.create((observer: Observer<IProcessOutput>) => {
            if (this.options.compile) {
                this.compile().subscribe((compileOutput) => {
                    if (compileOutput.type === ReturnType.SUCCESS) {
                        this.run().subscribe((runOutput) => {
                            completeObserver(observer, runOutput)
                        })
                    }
                })
            } else {
                this.run().subscribe((runOutput) => {
                    completeObserver(observer, runOutput)
                })
            }
        })
    }

    private compile(): Observable<IProcessOutput> {
        return Observable.create((observer: Observer<IProcessOutput>) => {
            new Process()
                .inDirectory(this.options.directory)
                .withExecutionTimeout(this.options.executionTimeout)
                .setCommand(this.commandParser(this.options.compile))
                .run()
                .onFinish((processOutput: IProcessOutput) => {
                    completeObserver(observer, processOutput)
                })
        })
    }

    private run(): Observable<IProcessOutput> {
        return Observable.create((observer: Observer<IProcessOutput>) => {
            const compileProcess = new Process()
                .inDirectory(this.options.directory)
                .withExecutionTimeout(this.options.executionTimeout)
                .setCommand(this.commandParser(this.options.run))
                .run()
            if (this.inputs) {
                compileProcess.writeInputWhenRequested(...this.inputs)
            }
            compileProcess.onFinish((output: IProcessOutput) => {
                completeObserver(observer, output)
            })
        })
    }

    private commandParser(cmd: string | undefined): string {
        const commandBuilder = new CommandBuilder(cmd || '')
        if (this.options.variables) {
            commandBuilder.setMap(this.options.variables)
        }
        return commandBuilder.buildAsString()
    }

}
