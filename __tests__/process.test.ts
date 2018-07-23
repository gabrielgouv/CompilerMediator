import 'jest'

import { Process, IProcessOutput, ReturnType } from '../src/runtime/process'

const fileDir = `${__dirname}/files/nodejs`

test('runs a nodejs file', (done) => {
    new Process()
        .directory(fileDir)
        .command('node test-output.js')
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
    new Process('node test-with-errors.js')
        .directory(fileDir)
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
        .directory(fileDir)
        .executionTimeout(100) // Sets an execution timeout
        .command('node test-infinite-loop.js')
        .run()
        .onFinish((processOutput: IProcessOutput) => {
            console.log(processOutput)
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
        .directory(fileDir)
        .executionTimeout(1000)
        .command('node test-io-sum.js')
        .run()
        .writeInput('7\n', '3\n')

    process.onFinish((processOutput: IProcessOutput) => {
        expect(processOutput.type).toBe(ReturnType.SUCCESS)
        expect(processOutput.data).toBe('10')
        expect(processOutput.code).toBe(0)
        expect(processOutput.took).not.toBe(-1)
        expect(processOutput.took).not.toBe(undefined)
        done()
    })

})
