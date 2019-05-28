/* eslint-disable @typescript-eslint/no-use-before-define */

import fs from 'fs';
import path from 'path';
import c from 'chalk';

import { Token } from './token';
import { Scanner } from './scanner';
import { TT } from './token-type';
import { Parser } from './parser';
import { RuntimeError } from './errors';
import { Interpreter } from './interpreter';

let hadError = false;
let hadRuntimeError = false;
let filename = 'repl';

const interpreter = new Interpreter();

export function runFile(filename: string): void {
  if (fs.existsSync(filename)) {
    const file = fs.readFileSync(filename, 'utf8');
    filename = path.basename(filename);
    run(file);

    if (hadError) process.exit(65);
    if (hadRuntimeError) process.exit(70);
  } else {
    console.error(c.redBright("File doesn't exists"));
    process.exit(1);
  }
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
