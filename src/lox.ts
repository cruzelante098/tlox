/* eslint-disable @typescript-eslint/no-use-before-define */

import fs from 'fs';
import c from 'chalk';

import { Token } from './token';
import { Scanner } from './scanner';
import { TT } from './token-type';
import { Parser } from './parser';
import { RuntimeError } from './runtime-error';
import { Interpreter } from './interpreter';
import { initRepl } from './repl';

let hadError = false;
let hadRuntimeError = false;
let filename = 'repl';

const interpreter = new Interpreter();

export function main(args: string[]): void {
  if (args.length > 3) {
    console.log('Usage: tlox [script path]');
    process.exit(64);
  } else if (args.length === 3) {
    runFile(args[2]);
  } else {
    runPrompt();
  }
}

export function runFile(path: string): void {
  const file = fs.readFileSync(path, 'utf8');
  filename = path[2].substring(path[2].lastIndexOf('/') + 1);
  run(file);

  if (hadError) process.exit(65);
  if (hadRuntimeError) process.exit(70);
}

export function runPrompt(): void {
  initRepl();
}

export function run(source: string): void {
  const scanner: Scanner = new Scanner();
  const tokens: Token[] = scanner.scan(source);

  const parser = new Parser();
  const statements = parser.parse(tokens);

  if (hadError) {
    return;
  }

  /* eslint-disable @typescript-eslint/no-non-null-assertion */

  interpreter.interpret(statements, { color: true });
}

export function error(line: number, message: string): void {
  reportError(line, 'when scanning', message);
}

export function errorAtToken({ type, line, lexeme }: Token, message: string): void {
  if (type == TT.EOF) {
    reportError(line, 'at end', message);
  } else {
    reportError(line, `at '${lexeme}'`, message);
  }
}

export function reportRuntimeError(error: RuntimeError): void {
  console.log(c.redBright(`${error.toString()} (at ${filename}:${error.token.line})`));
  hadRuntimeError = true;
}

export function reportError(line: number, where: string, message: string): void {
  console.error(c.redBright(`Error ${where}: ${message} (at ${filename}:${line})`));
  hadError = true;
}

export function setError(state: boolean): void {
  hadError = state;
}