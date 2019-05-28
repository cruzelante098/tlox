import { Interpreter } from "./interpreter";

export interface Callable {
  call(interpreter: Interpreter, args: any[]): any;
  readonly arity: number;
}

export namespace Callable {
  export function isCallable(obj: any): obj is Callable {
    const callable = obj as Callable;
    return callable.call !== undefined && callable.arity !== undefined;
  }
}
