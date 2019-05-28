import { Expr } from './expressions';
import { Token } from './token';

export abstract class Stmt {
  abstract accept<R>(visitor: Stmt.Visitor<R>): R;
}

export namespace Stmt {
  export interface Visitor<R> {
    visitExpressionStmt(stmt: Expression): R;
    visitPrintStmt(stmt: Print): R;
    visitLetStmt(stmt: Let): R;
  }

  export class Expression extends Stmt {
    constructor(public readonly expression: Expr) {
      super();
    }

    accept<R>(visitor: Visitor<R>): R {
      return visitor.visitExpressionStmt(this);
    }
  }

  export class Print extends Stmt {
    constructor(public readonly expression: Expr) {
      super();
    }

    accept<R>(visitor: Visitor<R>): R {
      return visitor.visitPrintStmt(this);
    }
  }

  export class Let extends Stmt {
    constructor(public readonly name: Token, public readonly initializer: Expr | null) {
      super();
    }

    accept<R>(visitor: Visitor<R>): R {
      return visitor.visitLetStmt(this);
    }
  }
}
