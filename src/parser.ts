/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Token } from './token';
import { Expr } from './expressions';
import { TT } from './token-type';
import * as Lox from './lox';
import { Stmt } from './statements';

export class Parser {
  private tokens: Token[] = [];
  private current = 0;

  parse(tokens: Token[]): Stmt[] {
    this.tokens = tokens;

    const statements: Stmt[] = [];
    try {
      while (!this.isAtEnd()) {
        statements.push(this.declaration()!);
      }
    } catch (e) {
      throw e;
    }

    return statements;
  }

  private declaration(): Stmt | null {
    try {
      if (this.match(TT.LET)) return this.letDeclaration();
      return this.statement();
    } catch (e) {
      this.synchronize();
      return null;
    }
  }

  private letDeclaration(): Stmt {
    const name = this.consume(TT.IDENTIFIER, 'Expected variable name');
    let initializer = null;

    if (this.match(TT.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TT.SEMICOLON, "Expected ';' after variable declaration");
    return new Stmt.Let(name, initializer);
  }

  private statement(): Stmt {
    if (this.match(TT.PRINT)) return this.printStatement();
    return this.expressionStatement();
  }

  private expressionStatement(): Stmt {
    const value = this.expression();
    this.consume(TT.SEMICOLON, "Expected ';' after expression");
    return new Stmt.Expression(value);
  }

  private printStatement(): Stmt {
    const value = this.expression();
    this.consume(TT.SEMICOLON, "Expected ';' after value");
    return new Stmt.Print(value);
  }

  private expression(): Expr {
    return this.equality();
  }

  private equality(): Expr {
    let expr = this.comparison();

    while (this.match(TT.BANG_EQUAL, TT.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr = this.addition();

    while (this.match(TT.GREATER, TT.GREATER_EQUAL, TT.LESS, TT.LESS_EQUAL)) {
      const operator = this.previous();
      const right = this.addition();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private addition(): Expr {
    let expr = this.multiplication();

    while (this.match(TT.MINUS, TT.PLUS)) {
      const operator = this.previous();
      const right = this.multiplication();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private multiplication(): Expr {
    let expr = this.unary();

    while (this.match(TT.SLASH, TT.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TT.BANG, TT.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Expr.Unary(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TT.FALSE)) return new Expr.Literal(false);
    if (this.match(TT.TRUE)) return new Expr.Literal(true);
    if (this.match(TT.NIL)) return new Expr.Literal(null);

    if (this.match(TT.NUMBER, TT.STRING)) {
      return new Expr.Literal(this.previous().literal);
    }

    if (this.match(TT.IDENTIFIER)) {
      return new Expr.Variable(this.previous());
    }

    if (this.match(TT.LP)) {
      const expr = this.expression();
      this.consume(TT.RP, "Expected ')' after expression");
      return new Expr.Grouping(expr);
    }

    throw new Parser.ParseError(this.peek(), 'Expected an expression');
  }

  private consume(type: TT, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new Parser.ParseError(this.peek(), message);
  }

  private match(...types: TT[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TT): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TT.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TT.SEMICOLON) return;

      switch (this.peek().type) {
        case TT.CLASS:
        case TT.FUN:
        case TT.LET:
        case TT.FOR:
        case TT.IF:
        case TT.WHILE:
        case TT.PRINT:
        case TT.RETURN:
          return;
      }

      this.advance();
    }
  }
}

export namespace Parser {
  export class ParseError {
    constructor(public readonly token: Token, public readonly message: string) {
      Lox.errorAtToken(token, message);
    }
  }
}

// TODO: add ternary operator
