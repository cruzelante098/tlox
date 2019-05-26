import { describe, it } from 'mocha';
import { expect } from 'chai';

import { Scanner } from '../src/scanner';
import { TT } from '../src/token-type';
import { TokenImpl } from '../src/token';

/* eslint-disable @typescript-eslint/explicit-function-return-type */

describe("Scanner", () => {
  it('recognizes simple operators', () => {
    const input = "!= == =";
    const scanner = new Scanner(input);
    const tokens = scanner.scanTokens();
    expect(tokens).to.be.deep.equal([
      new TokenImpl(TT.BANG_EQUAL, "!=", null, 1),
      new TokenImpl(TT.EQUAL_EQUAL, "==", null, 1),
      new TokenImpl(TT.EQUAL, "=", null, 1),
      new TokenImpl(TT.EOF, "", null, 1),
    ]);
  });
});
