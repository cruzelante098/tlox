import { LoxCallable } from './lox-callable';
import { Stmt } from './statements';
import { Interpreter } from './interpreter';
import { Environment } from './environment';
import { Return } from './return';

export class LoxFunction implements LoxCallable {
  constructor(private readonly declaration: Stmt.Function, private readonly closure: Environment) {}
  readonly arity: number = this.declaration.params.length;

  call(interpreter: Interpreter, args: any[]): any {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; ++i) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (e) {
      if (e instanceof Return) {
        return e.value;
      } else {
        throw e;
      }
    }
    return null;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme} >`;
  }
}
