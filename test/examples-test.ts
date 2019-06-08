/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import path from 'path';
import fs from 'fs';
import c from 'chalk';

import { expect } from 'chai';

import * as Lox from '../src/lox';
import { execute } from './test-utils';
import { Token } from '../src/token';
import { TT } from '../src/token-type';

let hadError = false;

function error(message: string): void {
  console.error(c.redBright(message));
  hadError = true;
}

const EXAMPLES_DIR = path.join(`${__dirname}/../examples/`);
const OUTPUT_DIR = path.join(`${__dirname}/examples_output/`);

let exampleFiles: string[];
let outputFiles: string[];

try {
  exampleFiles = fs.readdirSync(EXAMPLES_DIR);
  outputFiles = fs.readdirSync(OUTPUT_DIR).map(file => file.replace(/\.json$/, ''));
} catch (e) {
  error(e.message);
  process.exit(1);
}

// @ts-ignore
for (const example of exampleFiles) {
  // @ts-ignore
  if (!outputFiles.includes(example)) {
    error(`There isn't output for ${c.bold(example)}`);
  }
}

// @ts-ignore
for (const output of outputFiles) {
  // @ts-ignore
  if (!exampleFiles.includes(output)) {
    error(`There isn't an example for ${c.bold(output)}`);
  }
}

if (hadError) process.exit(1);

// @ts-ignore
const examples = exampleFiles.map(file => {
  return {
    filename: file,
    content: fs.readFileSync(path.join(EXAMPLES_DIR + file), 'utf8'),
  };
});

const outputs: {
  [file: string]: any;
} = Object.create(null);

// @ts-ignore
for (const file of outputFiles) {
  outputs[file] = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR + file + '.json'), 'utf8'));
}

describe('Examples tests', function() {
  this.timeout(7000);
  for (const example of examples) {
    if(outputs[example.filename].skip) {
      xit(`${example.filename}`);
      continue;
    }

    it(`${example.filename}`, () => {
      const source = example.content;
      const expected = outputs[example.filename];
      const originalLoxError = Lox.error;

      let errorMsg;

      // @ts-ignore
      Lox.error = (obj, message) => {
        if (obj instanceof Token) {
          const { type, line, lexeme } = obj as Token;
          if (type == TT.EOF) {
            errorMsg = `Error at the end: ${message} (at line ${line})`;
          } else {
            errorMsg = `Error at '${lexeme}': ${message} (at line ${line})`;
          }
        } else if (typeof obj === 'number') {
          errorMsg = `Error when scanning: ${message} (at line ${obj})`;
        }
        Lox.setError(true);
      }; // stub

      if (expected.test_type === 'output') {
        expect(execute(source), errorMsg).to.be.deep.equal(expected.program_output);
      } else {
        try {
          execute(source);
        } finally {
          expect(Lox.getError(), errorMsg).to.be.equal(
            expected.test_type === 'throws' ? true : false,
          );
          // @ts-ignore
          Lox.error = originalLoxError;
          Lox.setError(false);
        }
      }
    });
  }
});
