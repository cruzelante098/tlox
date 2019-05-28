import { Interpreter } from "./interpreter";

export interface LoxCallable {
  call(interpreter: Interpreter, args: any[]): any;
  readonly arity: number;
}

export namespace LoxCallable {
  export function isCallable(obj: any): obj is LoxCallable {
    const callable = obj as LoxCallable;
    return callable.call !== undefined && callable.arity !== undefined;
  }
}
