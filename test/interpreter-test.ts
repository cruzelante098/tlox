import { describe, it } from 'mocha';
import { expect } from 'chai';

import { Scanner } from '../src/scanner';
import { Interpreter } from '../src/interpreter';
import { Parser } from '../src/parser';

/* eslint-disable @typescript-eslint/explicit-function-return-type */

const scanner = new Scanner();
const parser = new Parser();
const interpreter = new Interpreter();

describe('Interpreter', () => {
  it('is capable of parsing a simple expression', () => {
    const result = execute('9 + 6 + 5');
    expect(result).to.be.equal('20');
  });
});

function execute(source: string): string | void {
  const tokens = scanner.scan(source);
  const ast = parser.parse(tokens);
  return interpreter.interpret(ast!);
}
