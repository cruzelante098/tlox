import { LoxCallable } from './lox-callable';
import { Stmt } from './statements';
import { Interpreter } from './interpreter';
import { Environment } from './environment';
import { Return } from './return';
import { LoxInstance } from './lox-instance';

export type FunctionType = 'function' | 'method' | 'initializer';

export class LoxFunction implements LoxCallable {
  readonly arity: number;

  private readonly declaration: Stmt.Function;
  private readonly closure: Environment;
  private readonly isInitializer: boolean;

  constructor(declaration: Stmt.Function, closure: Environment, isInitializer: boolean) {
    this.declaration = declaration;
    this.closure = closure;
    this.isInitializer = isInitializer;
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
        if (this.isInitializer) {
          return this.closure.getAt(0, 'this');
        }
        return e.value;
      } else {
        throw e;
      }
    }

    if (this.isInitializer) {
      return this.closure.getAt(0, 'this');
    }
    return null;
  }

  bind(instance: LoxInstance): LoxFunction {
    const environment = new Environment(this.closure);
    environment.define('this', instance);
    return new LoxFunction(this.declaration, environment, this.isInitializer);
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
