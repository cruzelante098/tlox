import { LoxCallable } from './lox-callable';
import { Stmt } from './statements';
import { Interpreter } from './interpreter';
import { Environment } from './environment';

export class LoxFunction implements LoxCallable {
  constructor(private readonly declaration: Stmt.Function) {}
  readonly arity: number = this.declaration.params.length;

  call(interpreter: Interpreter, args: any[]): any {
    const environment = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; ++i) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    interpreter.executeBlock(this.declaration.body, environment);
    return null;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme} >`;
  }
}
