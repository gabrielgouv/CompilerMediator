import 'jest'

import { Process } from '../src/runtime/process'

const fileDir = `${__dirname}/files/nodejs`

test('run a nodejs file', () => {
    const process: Process = new Process()
        .directory(fileDir)
        .run('node test-output.js')

    process.output.subscribe((data) => {
        expect(data.toString()).toBe('Hello World!')
    })

    process.error.subscribe((data) => {
        expect(data.toString()).toBe(undefined)
    })

    process.finish.subscribe((result) => {
        expect(result.code).toBe(0)
    })

})

test('run a nodejs file with errors', () => {
    const process: Process = new Process()
        .directory(fileDir)
        .run('node test-with-errors.js')

    process.output.subscribe((data) => {
        expect(data.toString()).toBe(undefined)
    })

    process.error.subscribe((data) => {
        expect(data.toString()).not.toBe(undefined)
    })

    process.finish.subscribe((result) => {
        expect(result.code).toBe(1)
    })

})

test('run a nodejs file with infinite loop', () => {
    const process: Process = new Process()
        .directory(fileDir)
        .execTimeout(100) // Sets an execution timeout
        .run('node test-infinite-loop.js')

    process.output.subscribe((data) => {
        expect(data.toString()).not.toBe(undefined)
    })

    process.error.subscribe((data) => {
        expect(data.toString()).toBe(undefined)
    })

    process.finish.subscribe((result) => {
        expect(result.code).toBe(null)
    })

})
