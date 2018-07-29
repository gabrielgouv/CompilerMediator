import 'jest'

import { Compiler } from '../src/compiler/compiler'
import { ReturnType } from '../src/runtime/process'

const fileDir = `${__dirname}/files/nodejs`

test('runs a nodejs file', (done) => {
    new Compiler()
        .runCommand('node test-output.js')
        .directory(fileDir)
        .execute((output) => {
            expect(output.type).toBe(ReturnType.SUCCESS)
            expect(output.data).toBe('Hello World!')
            expect(output.code).toBe(0)
            expect(output.took).not.toBe(-1)
            expect(output.took).not.toBe(undefined)
            done()
        })
})

test('runs a nodejs file with dynamic command', (done) => {
    new Compiler()
        .runCommand('node {fileName}')
        .directory(fileDir)
        .executionTimeout(5000)
        .putVariable('fileName', 'test-output.js')
        .execute((output) => {
            expect(output.type).toBe(ReturnType.SUCCESS)
            expect(output.data).toBe('Hello World!')
            expect(output.code).toBe(0)
            expect(output.took).not.toBe(-1)
            expect(output.took).not.toBe(undefined)
            done()
        })
})
