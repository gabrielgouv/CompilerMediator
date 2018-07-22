import 'jest'
import { CommandBuilder } from '../src/compiler/command-builder'

test('put 3 string variables', () => {
    const expectedResult = 'Testing the variables'
    const commandString = '{var1} {var2} {var3}'

    const command = new CommandBuilder(commandString)
        .set('var1', 'Testing')
        .set('var2', 'the')
        .set('var3', 'variables')
    expect(command.buildAsString()).toBe(expectedResult)
})

test('put 3 different types of variables', () => {
    const expectedResult = 'string true 42'
    const commandString = '{string} {boolean} {number}'

    const command = new CommandBuilder(commandString)
        .set('string', 'string')
        .set('boolean', true)
        .set('number', 42)
    expect(command.buildAsString()).toBe(expectedResult)
})

test('variables together', () => {
    const expectedResult = 'stringtrue42'
    const commandString = '{string}{boolean}{number}'

    const command = new CommandBuilder(commandString)
        .set('string', 'string')
        .set('boolean', true)
        .set('number', 42)
    expect(command.buildAsString()).toBe(expectedResult)
})

test('malformed variables 1', () => {
    const expectedResult = '{strin}g} true 42'
    const commandString = '{strin}g} {boolean} {number}'

    const command = new CommandBuilder(commandString)
        .set('string', 'string')
        .set('boolean', true)
        .set('number', 42)
    expect(command.buildAsString()).toBe(expectedResult)
})

test('malformed variables 2', () => {
    const expectedResult = '{string} {true number}'
    const commandString = '{{string}} {{boolean} number}'

    const command = new CommandBuilder(commandString)
        .set('string', 'string')
        .set('boolean', true)
        .set('number', 42)
    expect(command.buildAsString()).toBe(expectedResult)
})

test('put undefined as value', () => {
    const expectedResult = ''
    const commandString = '{undefinedVariable}'

    const command = new CommandBuilder(commandString)
        .set('undefinedVariable', undefined)
    expect(command.buildAsString()).toBe(expectedResult)
})

test('merge map of variables', () => {
    const expectedResult = 'var1 var2 var3 var4'
    const commandString = '{var1} {var2} {var3} {var4}'

    const variablesMap = new Map()
    variablesMap.set('var1', 'var1')
    variablesMap.set('var2', 'var2')

    const command = new CommandBuilder(commandString)
        .setMap(variablesMap)
        .set('var3', 'var3')
        .set('var4', 'var4')
    expect(command.buildAsString()).toBe(expectedResult)
})

test('without passed variables', () => {
    const expectedResult = 'test without passed variables {}'
    const commandString = 'test without passed variables {}'

    const command = new CommandBuilder(commandString)
    expect(command.buildAsString()).toBe(expectedResult)
})
