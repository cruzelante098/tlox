/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { expect } from 'chai';

import { Scanner } from '../src/scanner';
import { Interpreter } from '../src/interpreter';
import { Parser } from '../src/parser';

const scanner = new Scanner();
const parser = new Parser();
const interpreter = new Interpreter();

describe('Interpreter', () => {
  it('is capable of parsing a simple expression', () => {
    expect(execute('print 9 + 6 + 5;')).to.be.deep.equal(['20']);
  });
});

function execute(source: string): () => any {
  const tokens = scanner.scan(source);
  const ast = parser.parse(tokens);
  const callback = () => interpreter.interpret(ast);
  return consoleLogArgs(callback);
}

function consoleLogArgs(callback: () => void): any {
  const originalConsoleLog = console.log;
  const logArgs: any[] = [];

  console.log = (...args: any[]): void => {
    logArgs.push(...args);
  };

  try {
    callback();
  } catch (e) {
    throw e;
  } finally {
    console.log = originalConsoleLog;
  }

  return logArgs;
}
