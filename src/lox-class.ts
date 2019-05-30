import { LoxCallable } from './lox-callable';
import { Interpreter } from './interpreter';
import { LoxInstance } from './lox-instance';
import { LoxFunction } from './lox-function';

// eslint-disable-next-line @typescript-eslint/prefer-interface
type MethodMap = { [key: string]: LoxFunction };

export class LoxClass implements LoxCallable {
  public readonly name: string;
  public readonly arity = 0;

  private readonly methods: MethodMap;

  constructor(name: string, methods: MethodMap) {
    this.name = name;
    this.methods = methods;
  }

  call(interpreter: Interpreter, args: any[]): any {
    const instance = new LoxInstance(this);
    return instance;
  }

  findMethod(name: string): LoxFunction | undefined {
    if (name in this.methods) {
      return this.methods[name];
    }

    return undefined;
  }

  toString(): string {
    return this.name;
  }
}
