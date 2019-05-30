import { LoxCallable } from './lox-callable';
import { LoxInstance } from './lox-instance';
import { LoxFunction } from './lox-function';
import { Interpreter } from './interpreter';

export class LoxClass implements LoxCallable {
  public readonly name: string;

  private readonly superclass: LoxClass | null;
  private readonly methods: Map<string, LoxFunction>;

  constructor(name: string, superclass: LoxClass | null, methods: Map<string, LoxFunction>) {
    this.name = name;
    this.superclass = superclass;
    this.methods = methods;
  }

  call(interpreter: Interpreter, args: any[]): any {
    const instance = new LoxInstance(this);
    const initializer = this.findMethod('init');
    if (initializer) {
      initializer.bind(instance).call(interpreter, args);
    }
    return instance;
  }

  findMethod(name: string): LoxFunction | undefined {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    } else if (this.superclass) {
      return this.superclass.findMethod(name);
    }

    return undefined;
  }

  get arity(): number {
    const initializer = this.findMethod('init');
    if (initializer) {
      return initializer.arity;
    }
    return 0;
  }

  toString(): string {
    return this.name;
  }
}
