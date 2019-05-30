import { LoxCallable } from './lox-callable';
import { Stmt } from './statements';
import { Interpreter } from './interpreter';
import { Environment } from './environment';
import { Return } from './return';
import { LoxInstance } from './lox-instance';

export type FunctionType = 'function' | 'method';

export class LoxFunction implements LoxCallable {
  readonly arity: number;

  private readonly declaration: Stmt.Function;
  private readonly closure: Environment;

  constructor(declaration: Stmt.Function, closure: Environment) {
    this.declaration = declaration;
    this.closure = closure;
    this.arity = declaration.params.length;
  }

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

  bind(instance: LoxInstance): LoxFunction {
    const environment = new Environment(this.closure);
    environment.define('this', instance);
    return new LoxFunction(this.declaration, environment);
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
