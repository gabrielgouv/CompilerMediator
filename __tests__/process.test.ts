import 'jest'

import { Process, IProcessOutput, ReturnType } from '../src/runtime/process'
import { CommandNotDefinedError } from '../src/errors/command-not-defined-error'

const fileDir = `${__dirname}/files/nodejs`

test('runs a nodejs file', (done) => {
    new Process()
        .inDirectory(fileDir)
        .setCommand('node test-output.js')
        .run()
        .onFinish((processOutput: IProcessOutput) => {
            expect(processOutput.type).toBe(ReturnType.SUCCESS)
            expect(processOutput.data).toBe('Hello World!')
            expect(processOutput.code).toBe(0)
            expect(processOutput.took).not.toBe(-1)
            expect(processOutput.took).not.toBe(undefined)
            done()
        })
})

test('runs a nodejs file with errors', (done) => {
    new Process({
        cwd: fileDir,
        shell: true,
        windowsHide: false,
    })
        .inDirectory(fileDir)
        .setCommand('node test-with-errors.js')
        .run()
        .onFinish((processOutput: IProcessOutput) => {
            expect(processOutput.type).toBe(ReturnType.ERROR)
            expect(processOutput.data).not.toBe(undefined)
            expect(processOutput.code).toBe(1)
            expect(processOutput.took).not.toBe(-1)
            expect(processOutput.took).not.toBe(undefined)
            done()
        })
})

test('runs a nodejs file with infinite loop', (done) => {
    new Process()
        .inDirectory(fileDir)
        .withExecutionTimeout(100)
        .setCommand('node test-infinite-loop.js')
        .run()
        .onFinish((processOutput: IProcessOutput) => {
            expect(processOutput.type).toBe(ReturnType.TIMED_OUT)
            expect(processOutput.data).not.toBe(undefined)
            expect(processOutput.code).toBe(null)
            expect(processOutput.took).not.toBe(-1)
            expect(processOutput.took).not.toBe(undefined)
            done()
        })
})

test('runs a nodejs file that receives two numbers and sum', (done) => {
    const process = new Process()
        .inDirectory(fileDir)
        .withExecutionTimeout(1000)
        .setCommand('node test-io-sum.js')
        .run()
        .writeInputWhenRequested('7\n', '3\n') // need to use \n after input when using nodejs

    process.onFinish((processOutput: IProcessOutput) => {
        expect(processOutput.type).toBe(ReturnType.SUCCESS)
        expect(processOutput.data).toBe('10')
        expect(processOutput.code).toBe(0)
        expect(processOutput.took).not.toBe(-1)
        expect(processOutput.took).not.toBe(undefined)
        done()
    })
})

test('try to run without command', () => {
    expect(() => {
        new Process()
        .inDirectory(fileDir)
        .run()
    }).toThrow(CommandNotDefinedError)
})
