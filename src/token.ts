import { TT } from './token-type';

export interface Token {
  readonly type: TT;
  readonly lexeme: string;
  readonly literal: any;
  readonly line: number;
  toString(): string;
}

export class Token implements Token {
  constructor(
    readonly type: TT,
    readonly lexeme: string,
    readonly literal: any,
    readonly line: number,
  ) {}

  toString(): string {
    return this.type + ' ' + this.lexeme + ' ' + this.literal;
  }
}
