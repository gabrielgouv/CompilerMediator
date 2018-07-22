import 'jest'
import { Command } from '../src/compiler/command'

test('put 3 string variables', () => {
    const expectedResult = 'Testing the variables'
    const commandString = '{var1} {var2} {var3}'

    const command = new Command(commandString)
    command.putVariable('var1', 'Testing')
    command.putVariable('var2', 'the')
    command.putVariable('var3', 'variables')
    expect(command.buildCommand()).toBe(expectedResult)
})

test('put 3 different types of variables', () => {
    const expectedResult = 'string true 42'
    const commandString = '{string} {boolean} {number}'

    const command = new Command(commandString)
    command.putVariable('string', 'string')
    command.putVariable('boolean', true)
    command.putVariable('number', 42)
    expect(command.buildCommand()).toBe(expectedResult)
})

test('variables together', () => {
    const expectedResult = 'stringtrue42'
    const commandString = '{string}{boolean}{number}'

    const command = new Command(commandString)
    command.putVariable('string', 'string')
    command.putVariable('boolean', true)
    command.putVariable('number', 42)
    expect(command.buildCommand()).toBe(expectedResult)
})

test('malformed variables 1', () => {
    const expectedResult = '{strin}g} true 42'
    const commandString = '{strin}g} {boolean} {number}'

    const command = new Command(commandString)
    command.putVariable('string', 'string')
    command.putVariable('boolean', true)
    command.putVariable('number', 42)
    expect(command.buildCommand()).toBe(expectedResult)
})

test('malformed variables 2', () => {
    const expectedResult = '{string} {true number}'
    const commandString = '{{string}} {{boolean} number}'

    const command = new Command(commandString)
    command.putVariable('string', 'string')
    command.putVariable('boolean', true)
    command.putVariable('number', 42)
    expect(command.buildCommand()).toBe(expectedResult)
})

test('put undefined as value', () => {
    const expectedResult = ''
    const commandString = '{undefinedVariable}'

    const command = new Command(commandString)
    command.putVariable('undefinedVariable', undefined)
    expect(command.buildCommand()).toBe(expectedResult)
})

test('merge map of variables', () => {
    const expectedResult = 'var1 var2 var3 var4'
    const commandString = '{var1} {var2} {var3} {var4}'

    const variablesMap = new Map()
    variablesMap.set('var1', 'var1')
    variablesMap.set('var2', 'var2')

    const command = new Command(commandString)
    command.putVariables(variablesMap)
    command.putVariable('var3', 'var3')
    command.putVariable('var4', 'var4')
    expect(command.buildCommand()).toBe(expectedResult)
})

test('without passed variables', () => {
    const expectedResult = 'test without passed variables {}'
    const commandString = 'test without passed variables {}'

    const command = new Command(commandString)
    expect(command.buildCommand()).toBe(expectedResult)
})
