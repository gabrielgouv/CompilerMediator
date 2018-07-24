import kill from 'tree-kill'
import { spawn, ChildProcess, SpawnOptions } from 'child_process'
import { Observable, Observer } from 'rxjs'
import { ProcessNotStartedError } from '../errors/process-not-started-error'
import { CommandNotDefinedError } from '../errors/command-not-defined-error'

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
    private timeout: any
    private started!: [number, number]
    private processOutput: IProcessOutput

    constructor(private cmd?: string, options?: SpawnOptions) {
        this.processOutput = {}
        if (options) {
            this.spawnOptions = options
        } else {
            this.spawnOptions = {
                cwd: './',
                shell: true,
                windowsHide: true,
            }
        }
    }

    public inDirectory(directory: string): Process {
        this.spawnOptions.cwd = directory
        return this
    }

    public useShell(shell: boolean | string): Process {
        this.spawnOptions.shell = shell
        return this
    }

    public hideCommandPromptOnWindows(windowsHide: boolean): Process {
        this.spawnOptions.windowsHide = windowsHide
        return this
    }

    public withExecutionTimeout(timeout: number): Process {
        if (timeout && timeout > 0) {
            this.timeout = setTimeout(() => {
                this.kill()
            }, timeout)
        }
        return this
    }

    public onFinish(callback: (output: IProcessOutput) => void): Process {
        this.onClose().subscribe((processOutput) => {
            callback(processOutput)
        }, (error) => {
            throw error
        })
        return this
    }

    public writeInputOnRequested(...input: string[]): Process {
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

    public setCommand(cmd: string): Process {
        this.cmd = cmd
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
        this.setupOnExit()
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

    private onClose(): Observable<IProcessOutput> {
        return Observable.create((observer: Observer<IProcessOutput>) => {
            if (!this.childProcess) {
                observer.error(this.throwProcessNotStartedError())
            }
            this.childProcess.on('close', (code) => {
                if (code === null) {
                    this.processOutput.type = ReturnType.TIMED_OUT
                }
                this.processOutput.code = code
                this.processOutput.took = this.started ? process.hrtime(this.started)[1] / 1000000 : -1
                observer.next(this.processOutput)
                observer.complete()
            })
        })
    }

    private setupOnExit(): void {
        this.childProcess.on('exit', () => {
            clearTimeout(this.timeout)
        })
    }

    private throwProcessNotStartedError(msg?: string): never {
        msg = msg ? msg : 'Process not started.'
        throw new ProcessNotStartedError(msg)
    }

    private throwCommandNotDefinedError(msg?: string): never {
        msg = msg ? msg : 'Command to run the process not defined.'
        throw new CommandNotDefinedError(msg)
    }

}
