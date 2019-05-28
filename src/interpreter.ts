import c from 'chalk';

import { Expr } from './expressions';
import { TT } from './token-type';
import { Token } from './token';
import { RuntimeError } from './errors';
import * as Lox from './lox';
import { Stmt } from './statements';
import { Environment } from './environment';
import { ins } from './utils';
import { LoxCallable } from './lox-callable';
import { LoxFunction } from './lox-function';

/* eslint-disable @typescript-eslint/prefer-interface */
type Option = {
  color: boolean;
};

export class Interpreter implements Expr.Visitor<any>, Stmt.Visitor<void> {
  options: Option = { color: false };

  readonly globals: Environment = new Environment();
  private environment: Environment = this.globals;

  constructor() {
    this.globals.define(
      'clock',
      new (class implements LoxCallable {
        readonly arity = 0;

        /* eslint-disable @typescript-eslint/no-unused-vars */
        call(interpreter: Interpreter, args: any[]): any {
          return new Date().getTime();
        }

        toString(): string {
          return '<native fn>';
        }
      })(),
    );
  }

  interpret(statements: Stmt[], options?: Option): void {
    if (options) this.options = options;
    try {
      for (const stmt of statements) {
        this.execute(stmt);
      }
    } catch (e) {
      Lox.reportRuntimeError(e);
    }
  }

  // ----------
  // Statements
  // ----------

  visitFunctionStmt(stmt: Stmt.Function): void {
    const fun = new LoxFunction(stmt);
    this.environment.define(stmt.name.lexeme, fun);
  }

  visitIfStmt(stmt: Stmt.If): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      this.execute(stmt.thenBranch);
    }
  }

  visitWhileStmt(stmt: Stmt.While): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitBlockStmt(stmt: Stmt.Block): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  visitLetStmt(stmt: Stmt.Let): void {
    let value = null;
    if (stmt.initializer) {
      value = this.evaluate(stmt.initializer);
    }
    this.environment.define(stmt.name.lexeme, value);
  }

  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: Stmt.Print): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  // -----------
  // Expressions
  // -----------

  visitCallExpr(expr: Expr.Call): any {
    const callee = this.evaluate(expr.callee);

    const args = [];
    for (const arg of expr.args) {
      args.push(this.evaluate(arg));
    }

    if (!LoxCallable.isCallable(callee)) {
      throw new RuntimeError(expr.paren, 'Can only call functions and classes');
    }

    const fun: LoxCallable = callee as LoxCallable;

    if (args.length !== fun.arity) {
      throw new RuntimeError(expr.paren, `Expected ${fun.arity} but got ${args.length}`);
    }

    return fun.call(this, args);
  }

  visitLogicalExpr(expr: Expr.Logical): any {
    const left = this.evaluate(expr.left);

    // short-circuit evaluation
    if (expr.operator.type === TT.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitAssignExpr(expr: Expr.Assign): any {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  visitVariableExpr(expr: Expr.Variable): any {
    return this.environment.get(expr.name);
  }

  visitLiteralExpr(expr: Expr.Literal): any {
    return expr.value;
  }

  visitGroupingExpr(expr: Expr.Grouping): any {
    return this.evaluate(expr.expression);
  }

  visitUnaryExpr(expr: Expr.Unary): any {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TT.BANG:
        return !this.isTruthy(right);
      case TT.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
    }

    return null;
  }

  visitBinaryExpr(expr: Expr.Binary): any {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TT.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TT.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TT.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) > (right as number);
      case TT.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) >= (right as number);
      case TT.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) < (right as number);
      case TT.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) <= (right as number);
      case TT.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) - (right as number);
      case TT.PLUS:
        if (typeof left === 'number' && typeof right === 'number') {
          return (left as number) + (right as number);
        }
        if (typeof left === 'string' && (typeof right === 'string' || typeof right === 'number')) {
          return (left as string) + right.toString();
        }
        throw new RuntimeError(expr.operator, 'Operands must be two numbers or two strings');
      case TT.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) / (right as number);
      case TT.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) * (right as number);
    }

    return null;
  }

  private execute(statement: Stmt): void {
    statement.accept(this);
  }

  private stringify(obj: any): string {
    if (obj === null) return this.options.color ? c.yellow('nil') : 'nil';
    return typeof obj === 'string' ? obj : ins(obj, this.options.color);
  }

  private checkNumberOperands(operator: Token, left: any, right: any): void {
    if (typeof left === 'number' && typeof right === 'number') return;
    throw new RuntimeError(operator, 'Operands must be numbers');
  }

  private checkNumberOperand(operator: Token, operand: any): void {
    if (typeof operand === 'number') return;
    throw new RuntimeError(operator, 'Operand must be a number');
  }

  private isTruthy(obj: any): boolean {
    if (obj === null) return false;
    if (typeof obj === 'boolean') return obj as boolean;
    return true;
  }

  private isEqual(left: any, right: any): boolean {
    return left === right;
  }

  private evaluate(expr: Expr): any {
    return expr.accept(this);
  }

  public executeBlock(statements: Stmt[], environment: Environment): void {
    const previous = this.environment;
    try {
      this.environment = environment;
      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }
}
