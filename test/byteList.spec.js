/* Created by mclyde on 12/29/2017 */
const assert = require('chai').assert;
const ByteList = require('../dist/byteList').ByteList;
const _ = require('lodash');

describe('ByteList', () => {

    describe('Constructor', () => {

        it('param = Null', () => {
            const bytes = new ByteList();
            assert.isOk(bytes);
            assert.isOk(bytes.getBuffer());
            assert.equal(bytes.length, 0);
            assert.equal(bytes.getLength(), 0);
        });

        it('param = String', () => {
            const bytes = new ByteList('hello');
            assert.isOk(bytes);
            assert.isOk(bytes.getBuffer());
            assert.equal(bytes.length, 7);
            assert.equal(bytes.getLength(), 7);
        });

        it('param = Buffer', () => {
            const bytes = new ByteList(new Buffer([1, 2, 3, 4, 5]));
            assert.isOk(bytes);
            assert.isOk(bytes.getBuffer());
            assert.equal(bytes.length, 5);
            assert.equal(bytes.getLength(), 5);
        });

        it('param = Buffer', () => {
            const bytes = new ByteList(new Buffer([1, 2, 3, 4, 5]));
            assert.isOk(bytes);
            assert.isOk(bytes.getBuffer());
            assert.equal(bytes.length, 5);
            assert.equal(bytes.getLength(), 5);
        });

        it('param = Array of numbers', () => {
            const bytes = new ByteList([1, 2, 3, 4]);
            assert.isOk(bytes);
            assert.isOk(bytes.getBuffer());
            assert.equal(bytes.length, 4);
            assert.equal(bytes.getLength(), 4);
        });

    });

    describe('Functions', () => {

        it('should concat()', () => {
            const bytes = new ByteList([1, 2]);
            bytes.concat(new Buffer([3, 4]));
            bytes.index = 0;
            assert.equal(bytes.readByte(), 1);
            assert.equal(bytes.readByte(), 2);
            assert.equal(bytes.readByte(), 3);
            assert.equal(bytes.readByte(), 4);
        });

        it('should concat() with index not at the end', () => {
            const bytes = new ByteList([1, 2]);
            bytes.index = 0;
            bytes.concat(new Buffer([3, 4]));
            bytes.index = 0;
            assert.equal(bytes.readByte(), 1);
            assert.equal(bytes.readByte(), 2);
            assert.equal(bytes.readByte(), 3);
            assert.equal(bytes.readByte(), 4);
        });

        it('should insert()', () => {
            const bytes = new ByteList([1, 2]);
            bytes.index = 1;
            bytes.insert(new Buffer([3, 4]));
            bytes.index = 0;
            assert.equal(bytes.readByte(), 1);
            assert.equal(bytes.readByte(), 3);
            assert.equal(bytes.readByte(), 4);
            assert.equal(bytes.readByte(), 2);
        });

        it('should peekByte()', () => {
            assert.throws(() => {
                const bytes = new ByteList();
                bytes.peekByte();
            });

            const bytes2 = new ByteList([1, 2]);
            bytes2.index = 0;
            assert.equal(bytes2.peekByte(), 1);
            assert.equal(bytes2.index, 0);
        });

        it('should peekUInt16()', () => {
            assert.throws(() => {
                const b = new ByteList();
                b.peekUInt16();
            });

            const bytes = new ByteList([1, 2]);
            bytes.index = 0;
            assert.equal(bytes.peekUInt16(), 0x0201);
            assert.equal(bytes.index, 0);
            bytes.useLittleEndian = false;
            assert.equal(bytes.peekUInt16(), 0x0102);
        });

        it('should write()', () => {
            const b = new ByteList();
            b.writeByte(0xFA);
            assert.equal(b.index, 1);
            b.index = 0;
            assert.equal(b.readByte(), 0xFA);
        });

        it('should write() char', () => {
            const b = new ByteList();
            b.writeByte('A');
            assert.equal(b.index, 1);
            b.index = 0;
            assert.equal(b.readByte(), 'A'.charCodeAt(0));
        });

        it('should write() options.insert', () => {
            const b = new ByteList([1, 2]);
            b.index = 1;
            b.writeByte(3, {insert: true});
            b.index = 0;
            assert.equal(b.readByte(), 1);
            assert.equal(b.readByte(), 3);
            assert.equal(b.readByte(), 2);
        });

        it('should writeBool()', () => {
            const b = new ByteList();
            b.writeBool(true);
            b.writeBool(false);
            b.writeBool(true);
            b.index = 0;
            assert(b.readBool());
            assert(!b.readBool());
            assert(b.readBool());
        });

        it('should writeInt16()', () => {
            const b = new ByteList();
            b.writeInt16(0x0102);
            b.index = 0;
            assert.equal(b.readInt16(), 0x0102);

            b.useLittleEndian = false;
            b.index = 0;
            b.writeInt16(0x0304, {insert: true});
            b.index = 0;
            assert.equal(b.readInt16(), 0x0304);
        });

        it('should writeInt32()', () => {
            const b = new ByteList();
            b.writeInt32(0x01020304);
            b.index = 0;
            assert.equal(b.readInt32(), 0x01020304);

            b.useLittleEndian = false;
            b.index = 0;
            b.writeInt32(0x03040201, {insert: true});
            b.index = 0;
            assert.equal(b.readInt32(), 0x03040201);
        });

        it('should writeUInt16()', () => {
            const b = new ByteList();
            b.writeUInt16(0x0102);
            b.index = 0;
            assert.equal(b.readUInt16(), 0x0102);

            b.useLittleEndian = false;
            b.index = 0;
            b.writeUInt16(0x0304, {insert: true});
            b.index = 0;
            assert.equal(b.readUInt16(), 0x0304);
        });

        it('should writeUInt32()', () => {
            const b = new ByteList();
            b.writeUInt32(0xF1020304);
            b.index = 0;
            assert.equal(b.readUInt32(), 0xF1020304);

            b.useLittleEndian = false;
            b.index = 0;
            b.writeUInt32(0xF3040201, {insert: true});
            b.index = 0;
            assert.equal(b.readUInt32(), 0xF3040201);
        });

        it('should writeFloat()', () => {
            const b = new ByteList();
            b.writeFloat(10.15);
            b.index = 0;
            assert.equal(_.round(b.readFloat(), 2), 10.15);

            b.useLittleEndian = false;
            b.index = 0;
            b.writeFloat(123.321, {insert: true});
            b.index = 0;
            assert.equal(_.round(b.readFloat(), 3), 123.321);
        });

        it('should writeDouble()', () => {
            const b = new ByteList();
            b.writeDouble(10.15);
            b.index = 0;
            assert.equal(_.round(b.readDouble(), 2), 10.15);

            b.useLittleEndian = false;
            b.index = 0;
            b.writeDouble(123.321, {insert: true});
            b.index = 0;
            assert.equal(_.round(b.readDouble(), 3), 123.321);
        });

        it('should writeDate()', () => {
            const d1 = new Date();
            const d2 = new Date();
            d2.setDate(d2.getDate() - 1);
            const b = new ByteList();
            b.writeDate(d1);
            b.index = 0;
            assert.equal(b.readDate().toString(), d1.toString());

            b.useLittleEndian = false;
            b.index = 0;
            b.writeDate(d2, {insert: true});
            b.index = 0;
            assert.equal(b.readDate().toString(), d2.toString());
        });

        it('should writeString()', () => {
            const str1 = 'hello world';
            const str2 = 'good bye world';
            const b = new ByteList();
            b.writeString(str1);
            b.index = 0;
            assert.equal(b.readString(), str1);

            b.useLittleEndian = false;
            b.index = 0;
            b.writeString(str2, {insert: true});
            b.index = 0;
            assert.equal(b.readString(), str2);
        });

        it('should writeByteArray()', () => {
            const bytes = new ByteList();
            bytes.writeByteArray([1, 2, 3, 4], {});
            bytes.index = 0;
            const byteArray = bytes.readByteArray();
            assert.equal(byteArray[0], 1);
            assert.equal(byteArray[1], 2);
            assert.equal(byteArray[2], 3);
            assert.equal(byteArray[3], 4);
        });

        it('should readInt8()', () => {
            const bytes = new ByteList();
            bytes.writeByte(1);
            bytes.writeByte(2);
            bytes.writeByte(3);
            bytes.index = 0;
            assert.equal(bytes.readInt8(), 1);
            assert.equal(bytes.readInt8(), 2);
            assert.equal(bytes.readInt8(), 3);
        });

        it('should trimLeft()', () => {
            const bytes = new ByteList([1, 2, 3, 4]);
            bytes.trimLeft(1);
            bytes.index = 0;
            assert.equal(bytes.peekByte(), 2);

            bytes.trimLeft(4);
            assert.equal(bytes.index, 0);
            assert.equal(bytes.length, 0);
        });

        it('should trimRight()', () => {
            const bytes = new ByteList([1, 2, 3, 4]);
            bytes.trimRight(1);
            assert.equal(bytes.length, 3);

            bytes.trimRight(4);
            assert.equal(bytes.index, 0);
            assert.equal(bytes.length, 0);
        });

    });

});
