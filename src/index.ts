import fs from 'fs';
import * as readlineSync from 'readline-sync';
import { Token } from './token';
import { Scanner } from './scanner';
import c from 'chalk';

let hadError = false;

function main(): void {
  if (process.argv.length > 2) {
    console.log("Usage: tlox [script path]");
    process.exit(64);
  } else if (process.argv.length === 2) {
    runFile(process.argv[1]);
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
    console.log(token);
  }
}

export function error(line: number, message: string): void {
  report(line, "", message);
}

function report(line: number, where: string, message: string): void {
  console.error(c.blue(`[Line ${line}]`) + c.red('Error:') + message);
  hadError = true;
}
