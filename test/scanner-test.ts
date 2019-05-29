
import { expect } from 'chai';

import { Scanner } from '../src/scanner';
import { TT } from '../src/token-type';
import { Token } from '../src/token';

/* eslint-disable @typescript-eslint/explicit-function-return-type */

describe("Scanner", () => {
  it('recognizes simple operators', () => {
    const input = "!= == =";
    const scanner = new Scanner();
    const tokens = scanner.scan(input);
    expect(tokens).to.be.deep.equal([
      new Token(TT.BANG_EQUAL, "!=", null, 1),
      new Token(TT.EQUAL_EQUAL, "==", null, 1),
      new Token(TT.EQUAL, "=", null, 1),
      new Token(TT.EOF, "", null, 1),
    ]);
  });
});
