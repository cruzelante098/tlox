/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Token } from './token';
import { Expr } from './expressions';
import { TT } from './token-type';
import { ParseError } from './errors';
import { Stmt } from './statements';
import { FunctionType } from './lox-function';

export class Parser {
  private tokens: Token[] = [];
  private current = 0;

  private static readonly MAX_CALLABLE_ARGUMENTS = 64;

  parse(tokens: Token[]): Stmt[] {
    this.tokens = tokens;
    this.current = 0;

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
      else if (this.match(TT.CLASS)) return this.classDeclaration();
      else if (this.match(TT.FUN)) return this.function('function');
      return this.statement();
    } catch (e) {
      this.synchronize();
      return null;
    }
  }

  private classDeclaration(): Stmt.Class {
    const name = this.consume(TT.IDENTIFIER, 'Expected class name');

    let superclass = null;
    if (this.match(TT.LESS)) {
      this.consume(TT.IDENTIFIER, 'Expected superclass name');
      superclass = new Expr.Variable(this.previous());
    }

    this.consume(TT.LBRACE, "Expected '{' before class body");

    const methods: Stmt.Function[] = [];
    while (!this.check(TT.RBRACE) && !this.isAtEnd()) {
      methods.push(this.function('method'));
    }

    this.consume(TT.RBRACE, "Expected '}' after class body");
    return new Stmt.Class(name, superclass, methods);
  }

  private function(kind: FunctionType): Stmt.Function {
    const name = this.consume(TT.IDENTIFIER, `Expected ${kind} name`);
    this.consume(TT.LP, `Expected '(' after ${kind} name`);
    const parameters: Token[] = [];
    if (!this.check(TT.RP)) {
      do {
        if (parameters.length >= Parser.MAX_CALLABLE_ARGUMENTS) {
          ParseError.notify(
            this.peek(),
            `Cannot have more than ${Parser.MAX_CALLABLE_ARGUMENTS} parameters`,
          );
        }

        parameters.push(this.consume(TT.IDENTIFIER, 'Expected parameter name'));
      } while (this.match(TT.COMMA));
    }

    this.consume(TT.RP, "Expected ')' after parameters");
    this.consume(TT.LBRACE, `Expected '{' before ${kind} body`);
    const body = this.block();
    return new Stmt.Function(name, parameters, body);
  }

  private letDeclaration(): Stmt.Let {
    const name = this.consume(TT.IDENTIFIER, 'Expected variable name');
    let initializer = null;

    if (this.match(TT.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TT.SEMICOLON, "Expected ';' after variable declaration");
    return new Stmt.Let(name, initializer);
  }

  private statement(): Stmt {
    if (this.match(TT.IF)) return this.ifStatement();
    else if (this.match(TT.FOR)) return this.forStatement();
    else if (this.match(TT.PRINT)) return this.printStatement();
    else if (this.match(TT.RETURN)) return this.returnStatement();
    else if (this.match(TT.WHILE)) return this.whileStatement();
    else if (this.match(TT.LBRACE)) return new Stmt.Block(this.block());
    return this.expressionStatement();
  }

  private returnStatement(): Stmt.Return {
    const keyword = this.previous();
    let value = this.check(TT.SEMICOLON) ? null : this.expression();
    this.consume(TT.SEMICOLON, "Expected ';' after return value");
    return new Stmt.Return(keyword, value);
  }

  private forStatement(): Stmt {
    this.consume(TT.LP, "Expected '(' after 'for'");
    let initializer: Stmt | null;
    if (this.match(TT.SEMICOLON)) {
      initializer = null;
    } else if (this.match(TT.LET)) {
      initializer = this.letDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition: Expr | null = null;
    if (!this.check(TT.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(TT.SEMICOLON, "Expected ';' after loop condition");

    let increment: Expr | null = null;
    if (!this.check(TT.RP)) {
      increment = this.expression();
    }
    this.consume(TT.RP, "Expected ')' after for clauses");

    let body = this.statement();

    if (increment) {
      body = new Stmt.Block([body, new Stmt.Expression(increment)]);
    }

    if (!condition) {
      condition = new Expr.Literal(true);
    }

    body = new Stmt.While(condition, body);

    if (initializer) {
      body = new Stmt.Block([initializer, body]);
    }

    return body;
  }

  private whileStatement(): Stmt.While {
    this.consume(TT.LP, "Expected '(' after 'while'");
    const condition = this.expression();
    this.consume(TT.RP, "Expected ')' after while condition");
    const body = this.statement();

    return new Stmt.While(condition, body);
  }

  private ifStatement(): Stmt.If {
    this.consume(TT.LP, "Expected '(' after 'if'");
    const condition = this.expression();
    this.consume(TT.RP, "Expected ')' after if condition");

    const thenBranch = this.statement();
    let elseBranch = null;
    if (this.match(TT.ELSE)) {
      elseBranch = this.statement();
    }

    return new Stmt.If(condition, thenBranch, elseBranch);
  }

  private block(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.check(TT.RBRACE) && !this.isAtEnd()) {
      const decl = this.declaration();
      if (decl) statements.push(decl);
    }

    this.consume(TT.RBRACE, "Expected '}' after block");
    return statements;
  }

  private expressionStatement(): Stmt.Expression {
    const value = this.expression();
    this.consume(TT.SEMICOLON, "Expected ';' after expression");
    return new Stmt.Expression(value);
  }

  private printStatement(): Stmt.Print {
    const value = this.expression();
    this.consume(TT.SEMICOLON, "Expected ';' after value");
    return new Stmt.Print(value);
  }

  private expression(): Expr {
    return this.assignment();
  }

  private assignment(): Expr {
    const expr = this.or();

    if (this.match(TT.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Expr.Variable) {
        const name = expr.name;
        return new Expr.Assign(name, value);
      } else if (expr instanceof Expr.Get) {
        const get = expr;
        return new Expr.Set(get.object, get.name, value);
      }

      ParseError.notify(equals, 'Invalid assignment target');
    }

    return expr;
  }

  private or(): Expr {
    let expr = this.and();

    while (this.match(TT.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Expr.Logical(expr, operator, right);
    }

    return expr;
  }

  private and(): Expr {
    let expr = this.equality();

    while (this.match(TT.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Expr.Logical(expr, operator, right);
    }

    return expr;
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

    return this.call();
  }

  private call(): Expr {
    let expr = this.primary();

    while (true) {
      if (this.match(TT.LP)) {
        expr = this.finishCall(expr);
      } else if (this.match(TT.DOT)) {
        const name = this.consume(TT.IDENTIFIER, "Expected property name after '.'");
        expr = new Expr.Get(expr, name);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expr): Expr {
    const args: Expr[] = [];

    if (!this.check(TT.RP)) {
      do {
        if (args.length >= Parser.MAX_CALLABLE_ARGUMENTS) {
          ParseError.notify(
            this.peek(),
            `Cannot have more than ${Parser.MAX_CALLABLE_ARGUMENTS} arguments`,
          );
        }
        args.push(this.expression());
      } while (this.match(TT.COMMA));
    }

    const paren = this.consume(TT.RP, "Expected ')' after arguments");

    return new Expr.Call(callee, paren, args);
  }

  private primary(): Expr {
    if (this.match(TT.FALSE)) return new Expr.Literal(false);
    if (this.match(TT.TRUE)) return new Expr.Literal(true);
    if (this.match(TT.NIL)) return new Expr.Literal(null);

    if (this.match(TT.NUMBER, TT.STRING)) {
      return new Expr.Literal(this.previous().literal);
    }

    if (this.match(TT.SUPER)) {
      const keyword = this.previous();
      this.consume(TT.DOT, "Expected '.' after 'super'");
      const method = this.consume(TT.IDENTIFIER, 'Expected superclass method name');
      return new Expr.Super(keyword, method);
    }

    if (this.match(TT.THIS)) {
      return new Expr.This(this.previous());
    }

    if (this.match(TT.IDENTIFIER)) {
      return new Expr.Variable(this.previous());
    }

    if (this.match(TT.LP)) {
      const expr = this.expression();
      this.consume(TT.RP, "Expected ')' after expression");
      return new Expr.Grouping(expr);
    }

    throw new ParseError(this.peek(), 'Expected an expression');
  }

  private consume(type: TT, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new ParseError(this.peek(), message);
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

// TODO: add ternary operator
