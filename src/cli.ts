#!/usr/bin/env node

import { runFile } from './lox';
import { initRepl } from './repl';

if (process.argv.length > 3) {
  console.log('Usage: tlox [script path]');
  process.exit(64);
} else if (process.argv.length === 3) {
  runFile(process.argv[2]);
} else {
  initRepl();
}
