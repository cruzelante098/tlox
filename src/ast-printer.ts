// import { Expr } from './expressions';

// export class AstPrinter implements Expr.Visitor<string> {
//   print(expr: Expr): string {
//     return expr.accept(this);
//   }

//   visitBinaryExpr(expr: Expr.Binary): string {
//     return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
//   }

//   visitGroupingExpr(expr: Expr.Grouping): string {
//     return this.parenthesize('group', expr.expression);
//   }

//   visitLiteralExpr(expr: Expr.Literal): string {
//     if (expr.value === null) return 'nil';
//     return expr.value;
//   }

//   visitUnaryExpr(expr: Expr.Unary): string {
//     return this.parenthesize(expr.operator.lexeme, expr.right);
//   }

//   private parenthesize(name: string, ...exprs: Expr[]): string {
//     let builder = '(' + name;
//     for (const expr of exprs) {
//       builder += ' ';
//       builder += expr.accept(this);
//     }
//     builder += ')';
//     return builder;
//   }
// }
