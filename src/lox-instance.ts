import { LoxClass } from './lox-class';
import { Token } from './token';
import { RuntimeError } from './errors';

export class LoxInstance {
  private readonly klass: LoxClass;
  private readonly fields: { [key: string]: any } = {};

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  get(name: Token): any {
    if (name.lexeme in this.fields) {
      return this.fields[name.lexeme];
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method) return method;

    throw new RuntimeError(name, `Undefined property ${name.lexeme}`);
  }
  
  set(name: Token, value: any): void {
    this.fields[name.lexeme] = value;
  }
  
  toString(): string {
    return `${this.klass.name} instance`;
  }
}
