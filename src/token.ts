import { TT } from "./token-type";

export interface Token {
  readonly type: TT;
  readonly lexeme: string;
  readonly literal: any;
  readonly line: number;
  toString(): string;
}

export class TokenImpl implements Token {
  readonly type: TT;
  readonly lexeme: string;
  readonly literal: any;
  readonly line: number;

  constructor(type: TT, lexeme: string, literal: any, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString(): string {
    return this.type + " " + this.lexeme + " " + this.literal;
  }
}
