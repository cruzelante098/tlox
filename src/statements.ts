import { Expr } from './expressions';
import { Token } from './token';

export abstract class Stmt {
  abstract accept<R>(visitor: Stmt.Visitor<R>): R;
}

export namespace Stmt {
  export interface Visitor<R> {
    visitBlockStmt(stmt: Block): R;
    visitExpressionStmt(stmt: Expression): R;
    visitIfStmt(stmt: If): R;
    // visitClassStmt(stmt: Class): R;
    visitReturnStmt(stmt: Return): R;
    visitWhileStmt(stmt: While): R;
    visitFunctionStmt(stmt: Function): R;
    visitPrintStmt(stmt: Print): R;
    visitLetStmt(stmt: Let): R;
  }

  // export class Class extends Stmt {
  //   constructor(
  //     public readonly name: Token,
  //     public readonly superclass: Expr.Variable,
  //     public readonly methods: Stmt.Function[],
  //   ) {
  //     super();
  //   }

  //   accept<R>(visitor: Visitor<R>): R {
  //     return visitor.visitClassStmt(this);
  //   }
  // }

  export class Function extends Stmt {
    constructor(
      public readonly name: Token,
      public readonly params: Token[],
      public readonly body: Stmt[],
    ) {
      super();
    }

    accept<R>(visitor: Visitor<R>): R {
      return visitor.visitFunctionStmt(this);
    }
  }

  export class If extends Stmt {
    constructor(
      public readonly condition: Expr,
      public readonly thenBranch: Stmt,
      public readonly elseBranch: Stmt | null,
    ) {
      super();
    }

    accept<R>(visitor: Visitor<R>): R {
      return visitor.visitIfStmt(this);
    }
  }

  export class While extends Stmt {
    constructor(
      public readonly condition: Expr,
      public readonly body: Stmt,
    ) {
      super();
    }

    accept<R>(visitor: Visitor<R>): R {
      return visitor.visitWhileStmt(this);
    }
  }

  export class Return extends Stmt {
    constructor(
      public readonly keyword: Token,
      public readonly value: Expr | null,
    ) {
      super();
    }

    accept<R>(visitor: Visitor<R>): R {
      return visitor.visitReturnStmt(this);
    }
  }

  export class Block extends Stmt {
    constructor(public readonly statements: Stmt[]) {
      super();
    }

    accept<R>(visitor: Visitor<R>): R {
      return visitor.visitBlockStmt(this);
    }
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
