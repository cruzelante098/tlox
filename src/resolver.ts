import { Expr } from './expressions';
import { Stmt } from './statements';
import { Interpreter } from './interpreter';
import { Token } from './token';
import * as Lox from './lox';

type FunctionType = 'none' | 'function';

export class Resolver implements Expr.Visitor<void>, Stmt.Visitor<void> {
  private readonly scopes: { [key: string]: boolean }[] = [];
  private readonly interpreter: Interpreter;

  private currentFunction: FunctionType = 'none';

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  // ----------
  // Statements
  // ----------

  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.resolve(stmt.expression);
  }

  visitIfStmt(stmt: Stmt.If): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch) this.resolve(stmt.elseBranch);
  }

  visitPrintStmt(stmt: Stmt.Print): void {
    if (stmt.expression) this.resolve(stmt.expression);
  }

  visitReturnStmt(stmt: Stmt.Return): void {
    if (this.currentFunction === 'none')
      Lox.error(stmt.keyword, 'Cannot return from top-level code');

    if (stmt.value) this.resolve(stmt.value);
  }

  visitWhileStmt(stmt: Stmt.While): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }

  visitFunctionStmt(stmt: Stmt.Function): void {
    this.declare(stmt.name);
    this.define(stmt.name);
    this.resolveFunction(stmt, 'function');
  }

  visitBlockStmt(stmt: Stmt.Block): void {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
  }

  visitLetStmt(stmt: Stmt.Let): void {
    this.declare(stmt.name);
    if (stmt.initializer) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
  }

  // -----------
  // Expressions
  // -----------

  visitBinaryExpr(expr: Expr.Binary): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitLogicalExpr(expr: Expr.Logical): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitUnaryExpr(expr: Expr.Unary): void {
    this.resolve(expr.right);
  }

  visitCallExpr(expr: Expr.Call): void {
    this.resolve(expr.callee);

    for (const argument of expr.args) {
      this.resolve(argument);
    }
  }

  visitGroupingExpr(expr: Expr.Grouping): void {
    this.resolve(expr.expression);
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  visitLiteralExpr(expr: Expr.Literal): void {
    // nothing to resolve
  }

  visitAssignExpr(expr: Expr.Assign): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitVariableExpr(expr: Expr.Variable): void {
    if (this.scopes.length !== 0 && this.scopes.slice(-1)[0][expr.name.lexeme] === false) {
      Lox.error(expr.name, 'Cannot read local variable in its own initializer');
    }
    this.resolveLocal(expr, expr.name);
  }

  // --------
  // Resolver
  // --------

  resolve(statements: Stmt[]): void; // overload 1
  resolve(statements: Stmt): void; // overload 2
  resolve(expr: Expr): void; // overload 3

  resolve(obj: Stmt[] | Stmt | Expr): void {
    if (obj instanceof Array) {
      // overload 1
      (obj as Stmt[]).forEach((stmt: Stmt): void => this.resolve(stmt));
    } else if (obj instanceof Stmt) {
      // overload 2
      (obj as Stmt).accept(this);
    } else if (obj instanceof Expr) {
      // overload 3
      (obj as Expr).accept(this);
    }
  }

  // -------
  // Private
  // -------

  private resolveFunction(fun: Stmt.Function, type: FunctionType): void {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;

    this.beginScope();
    for (const param of fun.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(fun.body);
    this.endScope();

    this.currentFunction = enclosingFunction;
  }

  private resolveLocal(expr: Expr.Variable, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (name.lexeme in this.scopes[i]) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
    // Not found. Assume it is global.
  }

  private define(name: Token): void {
    if (this.scopes.length === 0) return;
    this.scopes.slice(-1)[0][name.lexeme] = true;
  }

  private declare(name: Token): void {
    if (this.scopes.length === 0) return;
    const scope = this.scopes.slice(-1)[0];

    if (name.lexeme in scope) {
      Lox.error(name, 'Variable with this name already declare in this scope');
    }

    scope[name.lexeme] = false;
  }

  private beginScope(): void {
    this.scopes.push({});
  }

  private endScope(): void {
    this.scopes.pop();
  }
}
