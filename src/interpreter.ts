import c from 'chalk';
import { inspect } from 'util';

function ins(x: any, colors: boolean = true): string {
  return inspect(x, { depth: 30, colors, maxArrayLength: 30 });
}

import { Expr } from './expressions';
import { TT } from './token-type';
import { Token } from './token';
import { RuntimeError } from './runtime-error';
import * as Lox from './lox';
import { Stmt } from './statements';

/* eslint-disable @typescript-eslint/prefer-interface */
type Option = {
  color: boolean;
};

export class Interpreter implements Expr.Visitor<any>, Stmt.Visitor<void> {
  options: Option = { color: false };

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

  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.evaluate(stmt.expression);
  }
  
  visitPrintStmt(stmt: Stmt.Print): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
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
    if (this.options.color) {
      if (obj === null) return c.yellow('nil');
      return ins(obj);
    } else {
      if (obj === null) return 'nil';
      return ins(obj, false);
    }
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
    if (obj === undefined) {
      console.error(
        c.yellow(
          "Hey! I found out that there's an object that is undefined at truthy evaluation, " +
            "and that shouldn't happen. I'll return false, but look out for this.",
        ),
      );
    }
    if (typeof obj === 'boolean') return obj as boolean;
    return true;
  }

  private isEqual(left: any, right: any): boolean {
    return left === right;
  }

  private evaluate(expr: Expr): any {
    return expr.accept(this);
  }
}
