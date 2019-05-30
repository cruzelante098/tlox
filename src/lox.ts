import fs from 'fs';
import path from 'path';
import c from 'chalk';

import { Token } from './token';
import { Scanner } from './scanner';
import { TT } from './token-type';
import { Parser } from './parser';
import { RuntimeError } from './errors';
import { Interpreter } from './interpreter';
import { Resolver } from './resolver';

let hadError = false;
let hadRuntimeError = false;
let sourceName = 'repl';

const interpreter = new Interpreter();

export function runFile(filename: string): void {
  if (fs.existsSync(filename)) {
    const file = fs.readFileSync(filename, 'utf8');
    sourceName = path.basename(filename);
    run(file);

    if (hadError) process.exit(65);
    if (hadRuntimeError) process.exit(70);
  } else {
    console.error(c.redBright("File doesn't exists"));
    process.exit(1);
  }
}

export function run(source: string): void {
  const scanner = new Scanner();
  const tokens = scanner.scan(source);

  const parser = new Parser();
  const statements = parser.parse(tokens);

  if (hadError) return;

  new Resolver(interpreter).resolve(statements);

  if (hadError) return; // Stop if there was a resolution error.

  interpreter.interpret(statements, { color: true });
}

export function error(line: number, message: string): void; // overload 1
export function error(token: Token, message: string): void; // overload 2

export function error(obj: Token | number, message: string): void {
  if (obj instanceof Token) {
    // overload 1
    const { type, line, lexeme } = obj as Token;
    if (type == TT.EOF) {
      reportError(line, 'at end', message);
    } else {
      reportError(line, `at '${lexeme}'`, message);
    }
  } else if (typeof obj === 'number') {
    // overload 2
    reportError(obj, 'when scanning', message);
  }
}

export function reportRuntimeError(error: RuntimeError): void {
  console.log(c.redBright(`${error.toString()} (at ${sourceName}:${error.token.line})`));
  hadRuntimeError = true;
}

export function reportError(line: number, where: string, message: string): void {
  console.error(c.redBright(`Error ${where}: ${message} (at ${sourceName}:${line})`));
  hadError = true;
}

export function setError(state: boolean): void {
  hadError = state;
}

export function getError(): boolean {
  return hadError;
}
