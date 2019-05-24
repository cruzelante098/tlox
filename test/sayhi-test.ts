import { describe, it } from 'mocha';
import { expect } from 'chai';
import sayHi from '../src/index';

describe("say hi", () => {
  it('says "hi"', () => {
    expect(sayHi()).to.be.eql("hi");
  });
});
