import { RuntimeError } from './errors';
import { Token } from './token';

export class Environment {
  private readonly values: { [key: string]: any } = Object.create(null);
  private readonly enclosing: Environment | null;

  constructor(enclosing?: Environment) {
    this.enclosing = enclosing || null;
  }

  define(name: string, value: any): void {
    this.values[name] = value;
  }

  get(name: Token): any {
    if (name.lexeme in this.values) {
      return this.values[name.lexeme];
    } else if (this.enclosing) {
      return this.enclosing.get(name);
    }

    return undefined;
  }

  getAt(distance: number, name: string): any {
    return this.ancestor(distance).values[name];
  }

  ancestor(distance: number): Environment {
    let environment: Environment | null = this;
    for (let i = 0; i < distance; i++) {
      environment = environment && environment.enclosing;
    }

    if (!environment) throw new Error('Environment is null');

    return environment;
  }

  assign(name: Token, value: any): void {
    if (name.lexeme in this.values) {
      this.values[name.lexeme] = value;
    } else if (this.enclosing) {
      this.enclosing.assign(name, value);
    } else {
      throw new RuntimeError(name, `Undefined variable '${name.lexeme}'`);
    }
  }

  assignAt(distance: number, name: Token, value: any): void {
    this.ancestor(distance).values[name.lexeme] = value;
  }
}
