import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Scanner } from '../src/scanner';
import { TokenType } from '../src/token-type';
import { Token } from '../src/token';

describe("Scanner", () => {
  it('recognizes simple operators', () => {
    const input = "!= == =";
    const scanner = new Scanner(input);
    const tokens = scanner.scanTokens();
    expect(tokens).to.be.deep.equal([
      new Token(TokenType.BANG_EQUAL, "!=", null, 1),
      new Token(TokenType.EQUAL_EQUAL, "==", null, 1),
      new Token(TokenType.EQUAL, "=", null, 1),
      new Token(TokenType.EOF, "", null, 1),
    ]);
  });
});
