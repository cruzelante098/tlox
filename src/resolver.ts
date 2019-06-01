import { Expr } from './expressions';
import { Stmt } from './statements';
import { Interpreter } from './interpreter';
import { Token } from './token';
import * as Lox from './lox';
import { FunctionType } from './lox-function';

type FunctionEnvironment = 'none' | 'function' | 'method' | 'initializer';
type ClassEnvironment = 'none' | 'class' | 'subclass';

export class Resolver implements Expr.Visitor<void>, Stmt.Visitor<void> {
  private readonly scopes: Map<string, boolean>[] = [];
  private readonly interpreter: Interpreter;

  private currentFunction: FunctionEnvironment = 'none';
  private currentClass: ClassEnvironment = 'none';

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
    this.scopes.push(new Map()); // global scope
  }

  // ----------
  // Statements
  // ----------

  visitClassStmt(stmt: Stmt.Class): void {
    const enclosingClass = this.currentClass;
    this.currentClass = 'class';

    this.declare(stmt.name);
    this.define(stmt.name);

    if (stmt.superclass && stmt.name.lexeme === stmt.superclass.name.lexeme) {
      Lox.error(stmt.superclass.name, 'A class cannot inherit from itself');
    }

    if (stmt.superclass) {
      this.currentClass = 'subclass';
      this.resolve(stmt.superclass);
      this.beginScope();
      this.innerScope().set('super', true);
    }

    this.beginScope();
    this.innerScope().set('this', true);
    for (const method of stmt.methods) {
      let declaration: FunctionType = 'method';
      if (method.name.lexeme === 'init') {
        declaration = 'initializer';
      }
      this.resolveFunction(method, declaration);
    }
    this.endScope();

    if (stmt.superclass) {
      this.endScope();
    }

    this.currentClass = enclosingClass;
  }

  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.resolve(stmt.expression);
  }

  visitIfStmt(stmt: Stmt.If): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch) {
      this.resolve(stmt.elseBranch);
    }
  }

  visitPrintStmt(stmt: Stmt.Print): void {
    if (stmt.expression) {
      this.resolve(stmt.expression);
    }
  }

  visitReturnStmt(stmt: Stmt.Return): void {
    if (this.currentFunction === 'none') {
      Lox.error(stmt.keyword, 'Cannot return from top-level code');
    }
    if (stmt.value) {
      if (this.currentFunction === 'initializer') {
        Lox.error(stmt.keyword, 'Cannot return a value from an initializer');
      }
      this.resolve(stmt.value);
    }
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

  visitSuperExpr(expr: Expr.Super): void {
    // TODO: make so if the method doesn't exist in superclass a static error is thrown
    if (this.currentClass === 'none') {
      Lox.error(expr.keyword, "Cannot use 'super' outside of a class");
    } else if (this.currentClass !== 'subclass') {
      Lox.error(expr.keyword, "Cannot use 'super' in a class with no superclass");
    } else {
      this.resolveLocal(expr, expr.keyword);
    }
  }

  visitThisExpr(expr: Expr.This): void {
    if (this.currentClass === 'none') {
      Lox.error(expr.keyword, "Cannot use 'this' outside of a class");
    } else {
      this.resolveLocal(expr, expr.keyword);
    }
  }

  visitSetExpr(expr: Expr.Set): void {
    this.resolve(expr.value);
    this.resolve(expr.object);
  }

  visitGetExpr(expr: Expr.Get): void {
    this.resolve(expr.object);
  }

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  visitLiteralExpr(expr: Expr.Literal): void {
    // nothing to resolve
  }

  visitAssignExpr(expr: Expr.Assign): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitVariableExpr(expr: Expr.Variable): void {
    if (this.innerScope().get(expr.name.lexeme) === false) {
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

  private resolveLocal(expr: Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        return this.interpreter.resolve(expr, this.scopes.length - 1 - i);
      }
    }
    if (this.interpreter.globals.get(name) === undefined) {
      Lox.error(name, 'Undefined variable');
    }
  }

  private define(name: Token): void {
    this.innerScope().set(name.lexeme, true);
  }

  private declare(name: Token): void {
    const scope = this.innerScope();

    if (scope.has(name.lexeme)) {
      Lox.error(name, 'Variable with this name already declare in this scope');
    }

    scope.set(name.lexeme, false);
  }

  private beginScope(): void {
    this.scopes.push(new Map());
  }

  private endScope(): void {
    this.scopes.pop();
  }

  private innerScope(): Map<string, boolean> {
    return this.scopes[this.scopes.length - 1];
  }
}
