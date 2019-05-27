/* eslint-disable @typescript-eslint/no-use-before-define */

import * as readlineSync from 'readline-sync';

import fs from 'fs';
import c from 'chalk';

import { inspect } from 'util';

import { Token } from './token';
import { Scanner } from './scanner';
import { TT } from './token-type';
import { Parser } from './parser';
import { RuntimeError } from './runtime-error';
import { Interpreter } from './interpreter';

let hadError = false;
let hadRuntimeError = false;
let filename: string;

const interpreter = new Interpreter();

function ins(x: any): string {
  return inspect(x, { depth: 30, colors: true, maxArrayLength: 30 });
}

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
  filename = 'repl';
  console.log('TLox REPL');
  for (;;) {
    const input = readlineSync.question('> ');
    run(input);
    hadError = false;
  }
}

export function run(source: string): void {
  const scanner: Scanner = new Scanner();
  const tokens: Token[] = scanner.scan(source);

  const parser = new Parser();
  const statements = parser.parse(tokens);

  if (hadError) return;

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
  console.log(`${filename}:${error.token.line}: ` + c.redBright(error.toString()));
  hadRuntimeError = true;
}

export function reportError(line: number, where: string, message: string): void {
  console.error(`${filename}:${line}: ` + c.redBright(`Error ${where}: ${message}`));
  hadError = true;
}
