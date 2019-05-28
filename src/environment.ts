import { RuntimeError } from './runtime-error';
import { Token } from './token';

export class Environment {
  private readonly values: { [key: string]: any } = {};

  define(name: string, value: any): void {
    this.values[name] = value;
  }

  get(name: Token): any {
    if (name.lexeme in this.values) {
      return this.values[name.lexeme];
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'`);
  }

  assign(name: Token, value: any): void {
    if (name.lexeme in this.values) {
      this.values[name.lexeme] = value;
    } else {
      throw new RuntimeError(name, `Undefined variable '${name.lexeme}'`);
    }
  }
}
