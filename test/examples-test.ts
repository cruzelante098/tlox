/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import path from 'path';
import fs from 'fs';
import c from 'chalk';

import { expect } from 'chai';

import * as Lox from '../src/lox';
import { execute } from './test-utils';

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
    file,
    content: fs.readFileSync(path.join(EXAMPLES_DIR + file), 'utf8'),
  };
});

const outputs: {
  [file: string]: { program_output?: []; test_type: 'output' | 'throws' | 'does_not_throw' };
} = Object.create(null);

// @ts-ignore
for (const file of outputFiles) {
  outputs[file] = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR + file + '.json'), 'utf8'));
}

describe('Examples tests', function() {
  this.timeout(7000);
  for (const example of examples) {
    it(`${example.file}`, () => {
      const source = example.content;
      const expected = outputs[example.file];
      const originalLoxError = Lox.error;

      if (expected.test_type === 'output') {
        expect(execute(source)).to.be.deep.equal(expected.program_output);
      } else {
        // @ts-ignore
        Lox.error = () => Lox.setError(true); // stub
        try {
          execute(source);
        } finally {
          expect(Lox.getError()).to.be.equal(expected.test_type === 'throws' ? true : false);
          // @ts-ignore
          Lox.error = originalLoxError;
          // @ts-ignore
          Lox.setError(false);
        }
      }
    });
  }
});
