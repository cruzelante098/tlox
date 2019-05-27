import { Expr } from './expressions';

export abstract class Stmt {
  abstract accept<R>(visitor: Stmt.Visitor<R>): R;
}

export namespace Stmt {
  export interface Visitor<R> {
    visitExpressionStmt(stmt: Expression): R;
    visitPrintStmt(stmt: Print): R;
  }

  export class Expression extends Stmt {
    constructor(readonly expression: Expr) {
      super();
    }

    accept<R>(visitor: Visitor<R>): R {
      return visitor.visitExpressionStmt(this);
    }
  }

  export class Print extends Stmt {
    constructor(readonly expression: Expr) {
      super();
    }

    accept<R>(visitor: Visitor<R>): R {
      return visitor.visitPrintStmt(this);
    }
  }
}
