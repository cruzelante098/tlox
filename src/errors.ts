import { Token } from './token';
import * as Lox from './lox';

export class ParseError extends Error {
  constructor(public readonly token: Token, public readonly message: string) {
    super(message);
    ParseError.notify(token, message);
  }

  static notify(token: Token, message: string): void {
    Lox.errorAtToken(token, message);
  }
}

export class RuntimeError extends Error {
  readonly token: Token;

  constructor(token: Token, message: string) {
    super(message);
    this.token = token;
  }
}
