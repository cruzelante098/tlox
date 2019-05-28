import { inspect } from 'util';

export function ins(x: any, colors: boolean = true): string {
  return inspect(x, { depth: 30, colors, maxArrayLength: 30 });
}
