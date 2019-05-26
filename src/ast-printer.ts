import { Expr } from './expressions';
import { TokenImpl } from './token';
import { TT } from './token-type';

export class AstPrinter implements Expr.Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Expr.Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Expr.Grouping): string {
    return this.parenthesize('group', expr.expression);
  }

  visitLiteralExpr(expr: Expr.Literal): string {
    if (expr.value === null) return 'nil';
    return expr.value;
  }

  visitUnaryExpr(expr: Expr.Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    let builder = '(' + name;
    for (const expr of exprs) {
      builder += ' ';
      builder += expr.accept(this);
    }
    builder += ')';
    return builder;
  }
}

// test

const expression = new Expr.Binary(
  new Expr.Unary(new TokenImpl(TT.MINUS, '-', null, 1), new Expr.Literal(123)),
  new TokenImpl(TT.STAR, '*', null, 1),
  new Expr.Grouping(
    new Expr.Binary(
      new Expr.Literal(45.67),
      new TokenImpl(TT.STAR, '+', null, 1),
      new Expr.Literal(45.2),
    ),
  ),
);

console.log(new AstPrinter().print(expression));
