/* Created by mclyde on 7/10/2019 */
const assert = require('chai').assert;
const ByteList = require('../dist/byteList').ByteList;
const _ = require('lodash');
const Buffer = require('buffer/').Buffer;

describe('Performance', () => {

  it('Should instantiate a new byte list with initial padding', () => {
    const bytes = new ByteList();
    assert.equal(bytes.length, 0);
    assert.equal(bytes['_buffer'].length, 100);
    assert.equal(bytes.getBuffer().length, 0);
  })

  it('Should be able to concat buffers and add needed padding correctly', () => {
    const bytes = new ByteList();
    assert.equal(bytes.length, 0);
    assert.equal(bytes.index, 0);
    assert.equal(bytes.buffer.length, 0);
    assert.equal(bytes['_buffer'].length, 100);
    bytes.concat(new Buffer(1, 1));
    assert.equal(bytes.length, 1);
    assert.equal(bytes.index, 0);
    assert.equal(bytes.buffer.length, 1);
    assert.equal(bytes['_buffer'].length, 100);
    bytes.concat(new Buffer(3, 1));
    assert.equal(bytes.length, 4);
    assert.equal(bytes.index, 3);
    assert.equal(bytes.buffer.length, 4);
    assert.equal(bytes['_buffer'].length, 100);
    bytes.concat(new Buffer(1, 1));
    assert.equal(bytes.length, 5);
    assert.equal(bytes.index, 4);
    assert.equal(bytes.buffer.length, 5);
    assert.equal(bytes['_buffer'].length, 100);
    bytes.concat(new Buffer(100, 1));
    assert.equal(bytes.length, 105);
    assert.equal(bytes.index, 104);
    assert.equal(bytes.buffer.length, 105);
    assert.equal(bytes['_buffer'].length, 300);
    bytes.concat(new Buffer(100, 1));
    assert.equal(bytes.length, 205);
    assert.equal(bytes.index, 204);
    assert.equal(bytes.buffer.length, 205);
    assert.equal(bytes['_buffer'].length, 300);
    bytes.concat(new Buffer(100, 1));
    assert.equal(bytes.length, 305);
    assert.equal(bytes.index, 304);
    assert.equal(bytes.buffer.length, 305);
    assert.equal(bytes['_buffer'].length, 500);
  });

  it('Should throw an error if trying to peek beyond the buffer length (even if there is padding available)', () => {
    const bytes = new ByteList();
    bytes.writeByte(1);
    assert.equal(bytes.length, 1);
    assert.equal(bytes.index, 1);
    assert.equal(bytes['_buffer'].length, 100);
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
