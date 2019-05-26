/* eslint-disable @typescript-eslint/no-use-before-define */

import * as readlineSync from 'readline-sync';

import fs from 'fs';
import c from 'chalk';

import { inspect } from 'util';

import { Token } from './token';
import { Scanner } from './scanner';
import { TT } from './token-type';
import { Parser } from './parser';
import { AstPrinter } from './ast-printer';
import { Expr } from './expressions';

let hadError = false;

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
  run(file);

  if (hadError) {
    process.exit(65);
  }
}

export function runPrompt(): void {
  console.log('TLox REPL');
  for (;;) {
    const input = readlineSync.question('> ');
    run(input);
    hadError = false;
  }
}

export function run(source: string): void {
  const scanner: Scanner = new Scanner(source);
  const tokens: Token[] = scanner.scanTokens();

  const parser = new Parser(tokens);
  const expr = parser.parse();

  if (hadError) return;

  console.log(new AstPrinter().print(expr as Expr));
}

export function error(line: number, message: string): void {
  report(line, '', message);
}

export function errorAtToken(token: Token, message: string): void {
  if (token.type == TT.EOF) {
    report(token.line, ' at end', message);
  } else {
    report(token.line, ` at '${token.lexeme}'`, message);
  }
}

export function report(line: number, where: string, message: string): void {
  console.error(
    c.blue(`[Line ${line}]`) + c.red(` Error ${where}: `) + message,
  );
  hadError = true;
}
