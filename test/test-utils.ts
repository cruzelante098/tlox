/* eslint-disable @typescript-eslint/explicit-function-return-type */

import * as Lox from '../src/lox';
import { Scanner } from '../src/scanner';
import { Parser } from '../src/parser';
import { Interpreter } from '../src/interpreter';
import { Resolver } from '../src/resolver';

export function consoleLogArgs(callback: () => void): any {
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

export function execute(source: string): () => any {
  return consoleLogArgs(() => {
    const scanner = new Scanner();
    const tokens = scanner.scan(source);
  
    const parser = new Parser();
    const statements = parser.parse(tokens);
  
    if (Lox.getError()) return;
  
    const interpreter = new Interpreter();
    new Resolver(interpreter).resolve(statements);
  
    if (Lox.getError()) return; // Stop if there was a resolution error.
  
    interpreter.interpret(statements);
  });
}
