import * as readlineSync from 'readline-sync';

import fs from 'fs';
import c from 'chalk';

import { inspect } from 'util';

import { Token } from './token';
import { Scanner } from './scanner';

let hadError = false;

function ins(x: any): string {
  return inspect(x, { depth: 30, colors: true, maxArrayLength: 30 });
}

export function main(args: string[]): void {
  if (args.length > 3) {
    console.log("Usage: tlox [script path]");
    process.exit(64);
  } else if (args.length === 3) {
    runFile(args[2]);
  } else {
    runPrompt();
  }
}

function runFile(path: string): void {
  const file = fs.readFileSync(path, 'utf8');
  run(file);

  if (hadError) {
    process.exit(65);
  }
}

function runPrompt(): void {
  console.log("TLox REPL");
  for (;;) {
    const input = readlineSync.question("> ");
    run(input);
    hadError = false;
  }
}

function run(source: string): void {
  const scanner: Scanner = new Scanner(source);
  const tokens: Token[] = scanner.scanTokens();

  for (const token of tokens) {
    console.log(ins(token.toString()));
  }
}

export function error(line: number, message: string): void {
  report(line, "", message);
}

function report(line: number, where: string, message: string): void {
  console.error(c.blue(`[Line ${line}]`) + c.red(' Error: ') + message);
  hadError = true;
}
