import kill from 'tree-kill'
import { spawn, ChildProcess, SpawnOptions } from 'child_process'
import { Observable, Observer } from 'rxjs'
import { ProcessNotStartedError } from '../errors/process-not-started-error'

export class Process {

    public output!: Observable<string | Buffer>
    public error!: Observable<string | Buffer>
    public finish!: Observable<{code: number, took: number}>

    private childProcess!: ChildProcess
    private spawnOptions: SpawnOptions
    private timeout: any
    private started!: [number, number]

    constructor(options?: SpawnOptions) {
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

    public directory(directory: string): Process {
        this.spawnOptions.cwd = directory
        return this
    }

    public shell(shell: boolean | string): Process {
        this.spawnOptions.shell = shell
        return this
    }

    public hideCommandPromptOnWindows(windowsHide: boolean): Process {
        this.spawnOptions.windowsHide = windowsHide
        return this
    }

    public execTimeout(timeout: number): Process {
        if (timeout && timeout > 0) {
            this.timeout = setTimeout(() => {
                this.kill()
            }, timeout)
        }
        return this
    }

    public onInputRequested(...input: string[]): Process {
        if (input) {
            for (const index of input.keys()) {
                this.childProcess.stdin.write(input[index])
            }
        }
        this.childProcess.stdin.end()
        return this
    }

    public run(command: string): Process {
        this.started = process.hrtime()
        this.childProcess = spawn(command, [], this.spawnOptions)
        this.setup()
        return this
    }

    public getProcess(): ChildProcess {
        return this.childProcess
    }

    public kill(): void {
        kill(this.childProcess.pid, 'SIGKILL')
    }

    private setup() {
        this.setupOutputCallback()
        this.setupErrorCallback()
        this.setupFinishCallback()
        this.childProcess.on('exit', () => {
            clearTimeout(this.timeout)
        })
    }

    private setupOutputCallback(): void {
        this.output = Observable.create((observer: Observer<string>) => {
            if (!this.childProcess) {
                observer.error(this.throwProcessNotStartedError())
            }
            this.childProcess.stdout.on('data', (data) => {
                observer.next(data.toString().trim())
                observer.complete()
            })
        })
    }

    private setupErrorCallback(): void {
        this.error = Observable.create((observer: Observer<string>) => {
            if (!this.childProcess) {
                observer.error(this.throwProcessNotStartedError())
            }
            this.childProcess.stderr.on('data', (data) => {
                observer.next(data.toString().trim())
                observer.complete()
            })
        })
    }

    private setupFinishCallback(): void {
        this.finish = Observable.create((observer: Observer<{code: number, took: number}>) => {
            if (!this.childProcess) {
                observer.error(this.throwProcessNotStartedError())
            }
            this.childProcess.on('close', (code) => {
                const took = this.started ? process.hrtime(this.started)[1] / 1000000 : -1
                observer.next({code, took})
                observer.complete()
            })
        })
    }

    private throwProcessNotStartedError(msg?: string): never {
        msg = msg ? msg : 'Process not started.'
        throw new ProcessNotStartedError(msg)
    }

}
