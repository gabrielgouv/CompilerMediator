import 'jest'

import { Process } from '../src/runtime/process'

const fileDir = `${__dirname}/files/nodejs`

test('runs a nodejs file', (done) => {
    const process: Process = new Process()
        .directory(fileDir)
        .run('node test-output.js')

    process.output.subscribe((data) => {
        expect(data).toBe('Hello World!')
    })

    process.error.subscribe((data) => {
        expect(data).toBe(undefined)
    })

    process.finish.subscribe((result) => {
        expect(result.code).toBe(0)
        done()
    })

})

test('runs a nodejs file with errors', (done) => {
    const process: Process = new Process()
        .directory(fileDir)
        .run('node test-with-errors.js')

    process.output.subscribe((data) => {
        expect(data).toBe(undefined)
    })

    process.error.subscribe((data) => {
        expect(data).not.toBe(undefined)
    })

    process.finish.subscribe((result) => {
        expect(result.code).toBe(1)
        done()
    })

})

test('runs a nodejs file with infinite loop', (done) => {
    const process: Process = new Process()
        .directory(fileDir)
        .execTimeout(100) // Sets an execution timeout
        .run('node test-infinite-loop.js')

    process.output.subscribe((data) => {
        expect(data).not.toBe(undefined)
    })

    process.error.subscribe((data) => {
        expect(data).toBe(undefined)
    })

    process.finish.subscribe((result) => {
        expect(result.code).toBe(null)
        done()
    })

})

test('runs a nodejs file that receives two numbers and sum', (done) => {
    const process: Process = new Process()
        .directory(fileDir)
        .execTimeout(1000)
        .run('node test-io-sum.js')

    process.writeInput('7\n', '3\n')

    process.output.subscribe((data) => {
        expect(data).toBe('10')
    })

    process.error.subscribe((data) => {
        expect(data).toBe(undefined)
    })

    process.finish.subscribe((result) => {
        expect(result.code).toBe(0)
        done()
    })

})
