/* Created by mclyde on 7/10/2019 */
const assert = require('chai').assert;
const ByteList = require('../dist/byteList').ByteList;
const _ = require('lodash');
const Buffer = require('buffer/').Buffer;

describe('Performance', () => {

  it('Should instantiate a new byte list with initial padding', () => {
    const bytes = new ByteList();
    assert.equal(bytes.length, 0);
    assert.equal(bytes.buffer.length, 5);
    assert.equal(bytes.getBuffer().length, 0);
  })

  it('Should be able to concat buffers and add needed padding correctly', () => {
    const bytes = new ByteList();
    assert.equal(bytes.length, 0);
    assert.equal(bytes.index, 0);
    assert.equal(bytes.buffer.length, 5); // Should be padded
    bytes.concat(new Buffer(1, 1));
    assert.equal(bytes.length, 1);
    assert.equal(bytes.index, 0);
    assert.equal(bytes.buffer.length, 5);
    bytes.concat(new Buffer(3, 1));
    assert.equal(bytes.length, 4);
    assert.equal(bytes.index, 0);
    assert.equal(bytes.buffer.length, 5);
    bytes.concat(new Buffer(1, 1));
    assert.equal(bytes.length, 5);
    assert.equal(bytes.index, 0);
    assert.equal(bytes.buffer.length, 5);
    bytes.concat(new Buffer(1, 1));
    assert.equal(bytes.length, 6);
    assert.equal(bytes.index, 0);
    assert.equal(bytes.buffer.length, 11);
  });

  it('Should throw an error if trying to peek beyond the buffer length (even if there is padding available)', () => {
    const bytes = new ByteList();
    bytes.writeByte(1);
    assert.equal(bytes.length, 1);
    assert.equal(bytes.index, 1);
    assert.equal(bytes.buffer.length, 5);
    bytes.index = 0;
    const a = bytes.peekByte();
    assert.equal(a, 1);
    const b = bytes.readByte();
    assert.equal(b, 1);
    assert.throws(() => {
      bytes.peekByte();
    });
  });

});
