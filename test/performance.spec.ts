/* Created by mclyde on 7/10/2019 */
import { assert } from 'chai';
import { ByteList } from '../src/byteList';
import { Buffer } from 'buffer';

describe('Performance', () => {

  it('Should instantiate a new byte list with initial padding', () => {
    const bytes = new ByteList();
    assert.equal(bytes.length, 0);
    assert.equal(bytes['_buffer'].length, 100);
    assert.equal(bytes.getBuffer().length, 0);
  })

  it('Should be able to concat buffers and add needed padding correctly', () => {
    const bytes = new ByteList();
    assert.equal(bytes.paddingSize, 100);
    assert.equal(bytes.length, 0);
    assert.equal(bytes.index, 0);
    assert.equal(bytes.getBuffer().length, 0);
    assert.equal(bytes['_buffer'].length, 100);
    bytes.concat(Buffer.alloc(1, 1));
    assert.equal(bytes.length, 1);
    assert.equal(bytes.index, 1);
    assert.equal(bytes.getBuffer().length, 1);
    assert.equal(bytes['_buffer'].length, 100);
    bytes.concat(Buffer.alloc(3, 1));
    assert.equal(bytes.length, 4);
    assert.equal(bytes.index, 4);
    assert.equal(bytes.getBuffer().length, 4);
    assert.equal(bytes['_buffer'].length, 100);
    bytes.concat(Buffer.alloc(1, 1));
    assert.equal(bytes.length, 5);
    assert.equal(bytes.index, 5);
    assert.equal(bytes.getBuffer().length, 5);
    assert.equal(bytes['_buffer'].length, 100);
    bytes.concat(Buffer.alloc(100, 1));
    assert.equal(bytes.length, 105);
    assert.equal(bytes.index, 105);
    assert.equal(bytes.getBuffer().length, 105);
    assert.equal(bytes['_buffer'].length, 205);
    bytes.concat(Buffer.alloc(100, 1));
    assert.equal(bytes.length, 205);
    assert.equal(bytes.index, 205);
    assert.equal(bytes.getBuffer().length, 205);
    assert.equal(bytes['_buffer'].length, 205);
    bytes.concat(Buffer.alloc(100, 1));
    assert.equal(bytes.length, 305);
    assert.equal(bytes.index, 305);
    assert.equal(bytes.getBuffer().length, 305);
    assert.equal(bytes['_buffer'].length, 405);
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
