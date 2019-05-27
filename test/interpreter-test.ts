import { describe, it } from 'mocha';
import { expect } from 'chai';

import { Scanner } from '../src/scanner';
import { Interpreter } from '../src/interpreter';
import { Parser } from '../src/parser';

/* eslint-disable @typescript-eslint/explicit-function-return-type */

describe('Interpreter', () => {
  let scanner = new Scanner();
  let parser = new Parser();
  let interpreter = new Interpreter();

  it('is capable of parsing a simple expression', () => {
    const source = '9 + 6 + 5';
    const tokens = scanner.scan(source);
    const ast = parser.parse(tokens);
    const result = interpreter.interpret(ast!);
    expect(result).to.be.equal('20');
  });
});
