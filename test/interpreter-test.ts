/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { expect } from 'chai';
import { execute } from './test-utils';

describe('Interpreter', () => {
  it('is capable of parsing a simple expression', () => {
    expect(execute('print 9 + 6 + 5;')).to.be.deep.equal(['20']);
  });
});
