import { assert } from 'chai';
import { ByteList } from '../src/byteList';
import * as _ from 'lodash';
import createStatsCollector = require("mocha/lib/stats-collector");

describe('ByteList', () => {

  describe('Static Bitwise Operations', () => {

    it('Should be able to set a bit', () => {
      let number = 0;
      number = ByteList.SetBit(number, true, 0);
      assert.equal(number, 1);
      number = ByteList.SetBit(number, true, 1);
      assert.equal(number, 3);
      number = ByteList.SetBit(number, false, 0);
      assert.equal(number, 2);
      number = ByteList.SetBit(number, false, 1);
      number = ByteList.SetBit(number, true, 2);
      assert.equal(number, 4);

      number = ByteList.SetBit(number, false, 2);
      assert.equal(number, 0);
      number = ByteList.SetBit(number, true, 31);
      assert.equal(number, 2147483648);
      number = ByteList.SetBit(number, false, 31);
      assert.equal(number, 0);
      number = ByteList.SetBit(number, true, 32);
      assert.equal(number, 0);
      number = ByteList.SetBit(number, true, -1);
      assert.equal(number, 0);

    });

    it('Should be able to get a bit', () => {
      let number = 6;
      assert.equal(ByteList.GetBit(number, 0), false);
      assert.equal(ByteList.GetBit(number, 1), true);
      assert.equal(ByteList.GetBit(number, 2), true);

      number = 0;
      for (let i=0; i<31; i++) {
        number = ByteList.SetBit(0, true, i);
        assert.equal(ByteList.GetBit(number, i), true);
      }
      assert.equal(ByteList.GetBit(number, 32), false);
      assert.equal(ByteList.GetBit(number, -1), false);
    });
  });

  describe('Padding', () => {

    it('Should be able to get the padding size', () => {
      const bytes = new ByteList();
      bytes.writeUInt32(123456);
      assert.isTrue(bytes.paddingSize > 0);
      assert.equal(bytes['_buffer'].length, bytes.paddingSize);
    });

    it('Should be able to set the padding size', () => {
      const bytes = new ByteList();
      bytes.writeUInt32(123456);
      assert.isTrue(bytes.paddingSize > 0);
      assert.equal(bytes['_buffer'].length, bytes.paddingSize);
      bytes.paddingSize = 10;
      for (let i = 0; i < 24; i++) {
        bytes.writeUInt32(i);
      }
      assert.equal(bytes.length, 100);
      assert.equal(bytes['_buffer'].length, 100);
      bytes.writeByte(1);
      assert.equal(bytes.length, 101);
      assert.equal(bytes['_buffer'].length, 111);
    });

    it('Should not be allowed to set a negative padding size', () => {
      const bytes = new ByteList();
      bytes.writeUInt32(123456);
      assert.isTrue(bytes.paddingSize > 0);
      bytes.paddingSize = -1;
      assert.isTrue(bytes.paddingSize >= 0);
    });

  });

  describe('Constructor', () => {

    it('param = Null', () => {
      const bytes = new ByteList();
      assert.isOk(bytes);
      assert.isOk(bytes.getBuffer());
      assert.equal(bytes.length, 0);
      assert.equal(bytes.getLength(), 0);
      assert.equal(bytes.paddingSize, 100);
      assert.equal(bytes.useLittleEndian, true);
    });

    it('param = String', () => {
      const bytes = new ByteList('hello');
      assert.isOk(bytes);
      assert.isOk(bytes.getBuffer());
      assert.equal(bytes.length, 7);
    });

    it('param = Buffer', () => {
      const bytes = new ByteList(Buffer.from([1, 2, 3, 4, 5]));
      assert.isOk(bytes);
      assert.isOk(bytes.getBuffer());
      assert.equal(bytes.length, 5);
    });

    it('param = large Buffer', () => {
      let buffer = Buffer.alloc(1000);
      const bytes = new ByteList(Buffer.from(buffer));
      assert.isOk(bytes);
      assert.isOk(bytes.getBuffer());
      assert.equal(bytes.length, 1000);
    });

    it('param = Array of numbers', () => {
      const bytes = new ByteList([1, 2, 3, 4]);
      assert.isOk(bytes);
      assert.isOk(bytes.getBuffer());
      assert.equal(bytes.length, 4);
      assert.equal(bytes.getLength(), 4);
    });

    it('param = large array of numbers', () => {
      const testData: number[] = [];
      for (let i = 1; i <= 1000; i++) {
        testData.push(i);
      }
      const bytes = new ByteList(testData);
      assert.isOk(bytes);
      assert.isOk(bytes.getBuffer());
      assert.equal(bytes.length, 1000);
      assert.equal(bytes.getLength(), 1000);
    });

    it('param = strange data type', () => {
      const testData = { a: "hello", b: "there" }
      const bytes = new ByteList(testData);
      assert.isOk(bytes);
      assert.isOk(bytes.getBuffer());
      assert.equal(bytes.length, 0);
      assert.equal(bytes.getLength(), 0);
    });

    it('should be independent', () => {
      let testData: ArrayBuffer = new ArrayBuffer(1000);
      const view = new Int8Array(testData);
      for (let i = 0; i < 1000; i++) {
        view[i] = i & 255;
      }
      const byteList1 = new ByteList(testData);
      byteList1.concat(testData)
      const byteList2 = new ByteList(testData);
      byteList2.concat(testData)

      byteList1.index = 1;
      for (let i = 0; i< 1000; i++) {
        Buffer.from([255])
      }

      byteList2.index = 0;
      for (let i = 0; i < 1000; i++) {
          assert.equal(byteList2.readByte(), i & 255);
      }
    });

  });

  describe('Concatenation', () => {

    it('should concat(Buffer)', () => {
      const bytes = new ByteList([0, 1, 2]);
      bytes.concat(Buffer.from([3, 4, 5, 6, 7, 8, 9]));

      for (let i = 0; i < 100; i++) {
        bytes.concat(Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
      }

      bytes.index = 0;
      for (let i = 0; i < 101; i++) {
        for (let j = 0; j < 10; j++) {
          assert.equal(bytes.readByte(), j);
        }
      }
    });

    it('should concat(ByteList)', () => {
      const bytes = new ByteList([0, 1, 2]);
      const otherBytes = new ByteList([3, 4, 5, 6, 7, 8, 9])
      bytes.concat(otherBytes);
      for (let i = 0; i < 100; i++) {
        bytes.concat(new ByteList([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
      }

      bytes.index = 0;
      for (let i = 0; i < 101; i++) {
        for (let j = 0; j < 10; j++) {
          assert.equal(bytes.readByte(), j);
        }
      }
    });

    it('should concat(ArrayBuffer)', () => {
      let testData: ArrayBuffer = new ArrayBuffer(10);
      const view = new Int8Array(testData);
      for (let i = 0; i < 10; i++) {
        view[i] = i;
      }
      const bytes = new ByteList(testData);
      for (let i = 0; i < 100; i++) {
        bytes.concat(testData)
      }

      bytes.index = 0;
      for (let i = 0; i < 101; i++) {
        for (let j = 0; j < 10; j++) {
          assert.equal(bytes.readByte(), j);
        }
      }
    });

    it('should concat() with index not at the end', () => {
      const bytes = new ByteList([1, 2]);
      bytes.index = 0;
      bytes.concat(Buffer.from([3, 4]));
      bytes.index = 0;
      assert.equal(bytes.readByte(), 1);
      assert.equal(bytes.readByte(), 2);
      assert.equal(bytes.readByte(), 3);
      assert.equal(bytes.readByte(), 4);
    });
  });

  describe('Insertion', () => {
    it('should be able to insert(Buffer)', () => {
      const bytes = new ByteList([1, 2]);
      bytes.index = 1;
      bytes.insert(Buffer.from([3, 4]));
      bytes.index = 0;
      assert.equal(bytes.readByte(), 1);
      assert.equal(bytes.readByte(), 3);
      assert.equal(bytes.readByte(), 4);
      assert.equal(bytes.readByte(), 2);
    });

    it('should be able to insert(ByteList)', () => {
      const bytes = new ByteList([1, 2, 3, 4]);
      bytes.index = 2;
      bytes.insert(new ByteList([10, 10]));
      bytes.index = 0;
      assert.equal(bytes.readByte(), 1);
      assert.equal(bytes.readByte(), 2);
      assert.equal(bytes.readByte(), 10);
      assert.equal(bytes.readByte(), 10);
      assert.equal(bytes.readByte(), 3);
      assert.equal(bytes.readByte(), 4);
    });

    it('should be able to insert(Uint8Array)', () => {
      const testData: ArrayBuffer = new ArrayBuffer(10)
      const view = new Int8Array(testData);
      for (let i=0; i<testData.byteLength; i++) {
        view[i] = i;
      }
      const bytes = new ByteList(view);
      bytes.index = 2;
      bytes.insert(new ByteList(view));
      bytes.index = 0;
      assert.equal(bytes.readByte(), 0);
      assert.equal(bytes.readByte(), 1);
      for (let i=0; i<10; i++) {
        assert.equal(bytes.readByte(), i);
      }
      for (let i=2; i<10; i++) {
        assert.equal(bytes.readByte(), i);
      }
    });

  });

  describe('Peek Functions', () => {
    it('should peekByte()', () => {
      assert.throws(() => {
        const b = new ByteList();
        b.peekByte();
      });

      const bytes = new ByteList([1, 2]);
      bytes.index = 0;
      assert.equal(bytes.peekByte(), 1);
      assert.equal(bytes.index, 0);

      assert.throws(() => {
        bytes.peekByte(2);
      });
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

      assert.throws(() => {
        bytes.peekUInt16(1);
      });
      assert.throws(() => {
        bytes.peekUInt16(2);
      });
    });

    it('should peekUInt32()', () => {
      assert.throws(() => {
        const b = new ByteList();
        b.peekUInt32();
      });

      const bytes = new ByteList([1, 2, 3, 4]);
      bytes.index = 0;
      assert.equal(bytes.peekUInt32(), 0x04030201);
      assert.equal(bytes.index, 0);
      bytes.useLittleEndian = false;
      assert.equal(bytes.peekUInt32(), 0x01020304);

      assert.throws(() => {
        bytes.peekUInt32(1);
      });
      assert.throws(() => {
        bytes.peekUInt32(2);
      });
      assert.throws(() => {
        bytes.peekUInt32(3);
      });
      assert.throws(() => {
        bytes.peekUInt32(4);
      });
    });
  });

  describe('Functions', () => {
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
      b.writeByte(3, {
        insert: true
      });
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
      b.writeBool(false);
      b.index = 0;
      assert(b.readBool());
      assert(!b.readBool());
      assert(b.readBool());
      assert(!b.readBool());
    });

    it('should writeInt16()', () => {
      const b = new ByteList();
      b.writeInt16(0x0102);
      b.index = 0;
      assert.equal(b.readInt16(), 0x0102);

      b.useLittleEndian = false;
      b.index = 0;
      b.writeInt16(0x0304, {
        insert: true
      });
      b.index = 0;
      assert.equal(b.readInt16(), 0x0304);

      const c = new ByteList();
      c.writeInt16(0);
      c.index = 0;
      assert.equal(c.readInt16(), 0);
    });

    it('should writeInt32()', () => {
      const b = new ByteList();
      b.writeInt32(0x01020304);
      b.index = 0;
      assert.equal(b.readInt32(), 0x01020304);

      b.useLittleEndian = false;
      b.index = 0;
      b.writeInt32(0x03040201, {
        insert: true
      });
      b.index = 0;
      assert.equal(b.readInt32(), 0x03040201);

      const c = new ByteList();
      c.writeInt32(0);
      c.index = 0;
      assert.equal(c.readInt32(), 0);
    });

    it('should writeUInt16()', () => {
      const b = new ByteList();
      b.writeUInt16(0x0102);
      b.index = 0;
      assert.equal(b.readUInt16(), 0x0102);

      b.useLittleEndian = false;
      b.index = 0;
      b.writeUInt16(0x0304, {
        insert: true
      });
      b.index = 0;
      assert.equal(b.readUInt16(), 0x0304);

      const c = new ByteList();
      c.writeUInt16(0);
      c.index = 0;
      assert.equal(c.readUInt16(), 0);
    });

    it('should writeUInt32()', () => {
      const b = new ByteList();
      b.writeUInt32(0xF1020304);
      b.index = 0;
      assert.equal(b.readUInt32(), 0xF1020304);

      b.useLittleEndian = false;
      b.index = 0;
      b.writeUInt32(0xF3040201, {
        insert: true
      });
      b.index = 0;
      assert.equal(b.readUInt32(), 0xF3040201);

      const c = new ByteList();
      c.writeUInt32(0);
      c.index = 0;
      assert.equal(c.readUInt32(), 0);
    });

    it('should writeFloat()', () => {
      const b = new ByteList();
      b.writeFloat(10.15);
      b.index = 0;
      assert.equal(_.round(b.readFloat(), 2), 10.15);

      b.useLittleEndian = false;
      b.index = 0;
      b.writeFloat(123.321, {
        insert: true
      });
      b.index = 0;
      assert.equal(_.round(b.readFloat(), 3), 123.321);

      const c = new ByteList();
      c.writeFloat(0);
      c.index = 0;
      assert.equal(c.readFloat(), 0);
    });

    it('should writeDouble()', () => {
      const b = new ByteList();
      b.writeDouble(10.15);
      b.index = 0;
      assert.equal(_.round(b.readDouble(), 2), 10.15);

      b.useLittleEndian = false;
      b.index = 0;
      b.writeDouble(123.321, {
        insert: true
      });
      b.index = 0;
      assert.equal(_.round(b.readDouble(), 3), 123.321);

      const c = new ByteList();
      c.writeDouble(0);
      c.index = 0;
      assert.equal(c.readDouble(), 0);
    });

    it('should writeDate()', () => {
      const d1 = new Date();
      const d2 = new Date();
      d2.setDate(d2.getDate() - 1);
      const b = new ByteList();
      b.writeDate(d1);
      b.index = 0;
      assert.equal(b.readDate()?.toString(), d1.toString());

      b.useLittleEndian = false;
      b.index = 0;
      b.writeDate(d2, {
        insert: true
      });
      b.index = 0;
      assert.equal(b.readDate()?.toString(), d2.toString());

      const c = new ByteList();
      c.writeDate(new Date());
      c.index = 0;
      assert.isOk(c.readDate());
    });

    it('Should be able to write date after other data', () => {
      const a = new ByteList();
      a.writeByte(1);
      a.writeByte(2);
      a.writeByte(3);
      a.writeByte(4);
      const date = new Date();
      a.writeDate(date);
      a.index = 0;
      assert.equal(a.readByte(), 1);
      assert.equal(a.readByte(), 2);
      assert.equal(a.readByte(), 3);
      assert.equal(a.readByte(), 4);
      assert.equal(Math.floor(date.getTime() / 1000), Math.floor((a.readDate()?.getTime() || 0) / 1000));
    });

    it('should writeString()', () => {
      const str1 = 'hello world';
      const str2 = 'good bye world';
      const b = new ByteList();
      b.writeString(str1);
      b.index = 0;
      assert.equal(b.readString(), str1);

      const c = new ByteList();
      c.writeString();
      c.index = 0;
      assert.equal(c.readString(), '');

      const d = new ByteList();
      d.writeString('123', { length: 7 });
      d.index = 0;
      assert.equal(d.readString({ length: 7 }), '123');

      const e = new ByteList();
      e.writeString('123456789', { length: 5 });
      e.writeString('987654321', { length: 3 });
      e.index = 0;
      assert.equal(e.readString({ length: 5 }), '12345');
      assert.equal(e.readString({ length: 3 }), '987');
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

      const c = new ByteList();
      c.writeByteArray([], {});
      c.index = 0;
      assert.equal(c.readByteArray().length, 0);
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
      console.log(bytes.getBuffer());
      bytes.trimLeft(1);
      console.log(bytes.getBuffer());
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

  describe('Checking for overruns', () => {

    it('Should throw overrun for byte', () => {
      const bytes = new ByteList([1]);
      bytes.index = 0;
      assert.equal(bytes.readByte(), 1);
      assert.throws(() => {
        bytes.readByte();
      });
    });

    it('Should throw overrun for bytes', () => {
      const bytes = new ByteList([1, 1, 1, 1]);
      bytes.index = 0;
      assert.equal(bytes.readBytes(4).length, 4);
      assert.throws(() => {
        bytes.readBytes(1);
      });
    });

    it('Should throw overrun for bool', () => {
      const bytes = new ByteList([1]);
      bytes.index = 0;
      assert.equal(bytes.readBool(), true);
      assert.throws(() => {
        bytes.readBool();
      });
    });

    it('Should throw overrun for int8', () => {
      const bytes = new ByteList([1]);
      bytes.index = 0;
      assert.equal(bytes.readInt8(), 1);
      assert.throws(() => {
        bytes.readInt8();
      });
    });

    it('Should throw overrun for int16', () => {
      const bytes = new ByteList([1, 0]);
      bytes.index = 0;
      assert.equal(bytes.readInt16(), 1);
      assert.throws(() => {
        bytes.readInt16();
      });
    });

    it('Should throw overrun for uint16', () => {
      const bytes = new ByteList([1, 0]);
      bytes.index = 0;
      assert.equal(bytes.readUInt16(), 1);
      assert.throws(() => {
        bytes.readUInt16();
      });
    });

    it('Should throw overrun for int32', () => {
      const bytes = new ByteList([1, 0, 0, 0]);
      bytes.index = 0;
      assert.equal(bytes.readInt32(), 1);
      assert.throws(() => {
        bytes.readInt32();
      });
    });

    it('Should throw overrun for uint32', () => {
      const bytes = new ByteList([1, 0, 0, 0]);
      bytes.index = 0;
      assert.equal(bytes.readUInt32(), 1);
      assert.throws(() => {
        bytes.readUInt32();
      });
    });

    it('Should throw overrun for float', () => {
      const bytes = new ByteList([0, 0, 0, 0, 0, 0, 0, 1]);
      bytes.index = 0;
      assert.equal(bytes.readFloat(), 0);
      assert.throws(() => {
        bytes.readFloat();
      });
    });

    it('Should throw overrun for double', () => {
      const bytes = new ByteList([0, 0, 0, 0, 0, 0, 0, 0]);
      bytes.index = 0;
      assert.equal(bytes.readDouble(), 0);
      assert.throws(() => {
        bytes.readDouble();
      });
    });

    it('Should throw overrun for date', () => {
      const bytes = new ByteList([0, 0, 0, 0, 0]);
      bytes.index = 0;
      const date = bytes.readDate();
      assert.equal(date, null);
    });

  });

  describe('ArrayBuffers', () => {

    it('Should be able to initialize from an ArrayBuffer', () => {
      const buffer = new ArrayBuffer(8);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < 8; i++) {
        view[i] = i;
      }
      const byteList = new ByteList(buffer);
      byteList.index = 0;
      for (let i = 0; i < 8; i++) {
        assert.equal(byteList.readByte(), view[i]);
      }
    });

  });

  describe('Fixed Length Strings', () => {

    it('Should be able to write a fixed length string', () => {
      const bytes = new ByteList();
      bytes.writeString("Matt's Test", { length: 24 });
      bytes.index = 0;
      const str = bytes.readString({ length: 24 });
      assert.equal(str, "Matt's Test");
    });

  });

  describe('Misc', () => {

    it('Should be able to call toString()', () => {
      const bytes = new ByteList();

    })
  });

});
