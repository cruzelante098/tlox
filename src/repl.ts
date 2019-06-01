/* eslint-disable @typescript-eslint/explicit-function-return-type */

import c from 'chalk';
import readline from 'readline';

import * as Lox from './lox';
import { Scanner } from './scanner';
import { Parser } from './parser';
import { Token } from './token';
import { Interpreter } from './interpreter';
import { Resolver } from './resolver';
import { TT } from './token-type';

const interpreter: Interpreter = new Interpreter();
let indent = 0;

export function initRepl(): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer,
  });

  let input = '';
  const scanner = new Scanner();

  console.log('TLox REPL');
  rl.prompt();
  rl.on('line', line => {
    input += line + '\n';
    const tokens = scanner.scan(input);
    const balance = parBalance(tokens);
    if (balance === 'greaterLP') {
      rl.setPrompt('...'.repeat(indent) + ' ');
    } else if (balance === 'same') {
      run(tokens);
      Lox.setError(false);
      rl.setPrompt('> ');
      input = '';
    } else if (balance === 'greaterRP') {
      console.log(c.red('More right parenthesis than left ones'));
      rl.setPrompt('> ');
      input = '';
    }
    rl.prompt();
  });

  // rl.on('close', () => {
  //   console.log(chalk.blueBright('\nBye'));
  //   rl.close();
  // });

  rl.on('SIGINT', () => {
    console.log(c.blueBright('\nBye'));
    rl.close();
  });
}

function parBalance(tokens: Token[]): 'greaterLP' | 'same' | 'greaterRP' {
  const lp = tokens.filter(({ type }) => type === TT.LP || type === TT.LBRACE).length;
  const rp = tokens.filter(({ type }) => type === TT.RP || type === TT.RBRACE).length;
  if (lp > rp) {
    indent = lp - rp;
    return 'greaterLP';
  } else if (lp === rp) {
    return 'same';
  }
  indent = 0;
  return 'greaterRP';
}

function run(tokens: Token[]): void {
  const parser = new Parser();
  const statements = parser.parse(tokens);

  if (Lox.getError()) return;

  new Resolver(interpreter).resolve(statements);

  if (Lox.getError()) return; // Stop if there was a resolution error.

  interpreter.interpret(statements, { color: true });
}

function completer(line: string): any {
  const completions = Object.keys(Scanner.keywords);
  const hits = completions.filter(c => c.startsWith(line));
  return [hits.length ? hits : completions, line];
}
