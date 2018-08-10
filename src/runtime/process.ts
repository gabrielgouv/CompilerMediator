import kill from 'tree-kill'
import { spawn, ChildProcess, SpawnOptions } from 'child_process'
import { Observable, Observer } from 'rxjs'
import { ProcessNotStartedError } from '../errors/process-not-started-error'
import { CommandNotDefinedError } from '../errors/command-not-defined-error'
import { Logger } from '../utils/logger'
import { completeObserver } from '../utils/rxjs-util'

export enum ReturnType {
    SUCCESS,
    ERROR,
    TIMED_OUT,
}

export interface IProcessOutput {
    type?: ReturnType
    code?: number
    data?: string
    took?: number
}

export class Process {

    private childProcess!: ChildProcess
    private spawnOptions: SpawnOptions
    private cmd!: string
    private timeout: any
    private started!: [number, number]
    private processOutput: IProcessOutput

    constructor(options?: SpawnOptions) {
        this.processOutput = {}
        if (options) {
            Logger.debug(`Using custom options: ${JSON.stringify(options)}`)
            this.spawnOptions = options
        } else {
            Logger.debug('Options not set. Using default options.')
            this.spawnOptions = {
                cwd: './',
                shell: true,
                windowsHide: true,
            }
        }
    }

    public inDirectory(directory: string | undefined): Process {
        this.spawnOptions.cwd = directory || './'
        return this
    }

    public withExecutionTimeout(timeout: number | undefined): Process {
        if (timeout && timeout > 0) {
            this.timeout = setTimeout(() => {
                this.kill()
            }, timeout)
        }
        return this
    }

    public onFinish(callback: (output: IProcessOutput) => void): Process {
        this.onExit().subscribe((processOutput) => {
            callback(processOutput)
        }, (error) => {
            throw error
        })
        return this
    }

    public writeInputWhenRequested(...input: string[]): Process {
        if (!this.childProcess) {
            this.throwProcessNotStartedError()
        }
        if (input) {
            for (const index of input.keys()) {
                this.childProcess.stdin.write(input[index])
            }
            this.childProcess.stdin.end()
        }
        return this
    }

    public setCommand(cmd: string | undefined): Process {
        this.cmd = cmd || this.throwCommandNotDefinedError()
        return this
    }

    public run(): Process {
        if (this.cmd) {
            this.started = process.hrtime()
            this.childProcess = spawn(this.cmd, [], this.spawnOptions)
            this.setupListeners()
            return this
        }
        throw this.throwCommandNotDefinedError()
    }

    public getProcess(): ChildProcess {
        return this.childProcess
    }

    public kill(): void {
        kill(this.childProcess.pid, 'SIGKILL')
    }

    private setupListeners() {
        this.setupOnOutput()
        this.setupOnError()
    }

    private setupOnOutput(): void {
        if (!this.childProcess) {
            this.throwProcessNotStartedError()
        }
        this.childProcess.stdout.on('data', (data) => {
            this.processOutput.type = ReturnType.SUCCESS
            this.processOutput.data = data.toString().trim()
        })
    }

    private setupOnError(): void {
        if (!this.childProcess) {
            this.throwProcessNotStartedError()
        }
        this.childProcess.stderr.on('data', (data) => {
            this.processOutput.type = ReturnType.ERROR
            this.processOutput.data = data.toString().trim()
        })
    }

    private onExit(): Observable<IProcessOutput> {
        return Observable.create((observer: Observer<IProcessOutput>) => {
            if (!this.childProcess) {
                observer.error(this.throwProcessNotStartedError())
            }
            this.childProcess.on('exit', (code) => {
                clearTimeout(this.timeout)
                if (code === null) {
                    Logger.debug('Process timed out')
                    this.processOutput.type = ReturnType.TIMED_OUT
                }
                this.processOutput.code = code
                this.processOutput.took = this.started ? process.hrtime(this.started)[1] / 1000000 : -1
                completeObserver(observer, this.processOutput)
            })
        })
    }

    private throwProcessNotStartedError(msg?: string): never {
        msg = msg || 'Process not started.'
        throw new ProcessNotStartedError(msg)
    }

    private throwCommandNotDefinedError(msg?: string): never {
        msg = msg || 'Command to run the process not defined.'
        throw new CommandNotDefinedError(msg)
    }

}
