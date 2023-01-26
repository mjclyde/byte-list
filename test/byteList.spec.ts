import { assert, expect } from 'chai';
import { ByteList, DataTypes } from '../src/byteList';
import * as _ from 'lodash';

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
      for (let i = 0; i < 31; i++) {
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
      const buffer = Buffer.alloc(1000);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bytes = new ByteList(testData as any);
      assert.isOk(bytes);
      assert.isOk(bytes.getBuffer());
      assert.equal(bytes.length, 0);
      assert.equal(bytes.getLength(), 0);
    });

    it('should be independent', () => {
      const testData: ArrayBuffer = new ArrayBuffer(1000);
      const view = new Int8Array(testData);
      for (let i = 0; i < 1000; i++) {
        view[i] = i & 255;
      }
      const byteList1 = new ByteList(testData);
      byteList1.concat(testData)
      const byteList2 = new ByteList(testData);
      byteList2.concat(testData)

      byteList1.index = 1;
      for (let i = 0; i < 1000; i++) {
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
      const testData: ArrayBuffer = new ArrayBuffer(10);
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
      for (let i = 0; i < testData.byteLength; i++) {
        view[i] = i;
      }
      const bytes = new ByteList(view);
      bytes.index = 2;
      bytes.insert(new ByteList(view));
      bytes.index = 0;
      assert.equal(bytes.readByte(), 0);
      assert.equal(bytes.readByte(), 1);
      for (let i = 0; i < 10; i++) {
        assert.equal(bytes.readByte(), i);
      }
      for (let i = 2; i < 10; i++) {
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

  describe('Write and Read Methods', () => {
    it('should writeByte(byte), writeData(BYTE), readByte(), and readData(BYTE) with no options', () => {
      const b = new ByteList();
      b.writeByte(0xFA);
      b.writeByte(0xFB);
      b.writeByte(0xFC);
      b.writeByte(0xFD);
      assert.equal(b.index, 4);

      b.index = 2;
      b.writeByte(0xEA,);
      assert.equal(b.index, 3);

      b.index = 0;
      assert.equal(b.readByte(), 0xFA);
      assert.equal(b.readByte(), 0xFB);
      assert.equal(b.readByte(), 0xEA);
      assert.equal(b.readByte(), 0xFD);

      b.index = 0;
      b.writeData(DataTypes.BYTE, 0x0A);
      b.writeData(DataTypes.BYTE, 0x0B);
      b.writeData(DataTypes.BYTE, 0x0C);
      b.writeData(DataTypes.BYTE, 0x0D);

      b.index = 0
      assert.equal(b.readData(DataTypes.BYTE), 0x0A);
      assert.equal(b.readData(DataTypes.BYTE), 0x0B);
      assert.equal(b.readData(DataTypes.BYTE), 0x0C);
      assert.equal(b.readData(DataTypes.BYTE), 0x0D);
    });

    it('should writeByte(byte) with insert option and readByte()', () => {
      const b = new ByteList();
      b.writeByte(0xFA);
      b.writeByte(0xFB);
      b.writeByte(0xFC);
      b.writeByte(0xFD);
      b.writeByte(0xFE);
      assert.equal(b.index, 5);

      b.index = 2;
      b.writeByte(0xEA, { insert: true });
      b.writeByte(0xEB, { insert: true });
      assert.equal(b.index, 4);

      b.index = 0;
      assert.equal(b.readByte(), 0xFA);
      assert.equal(b.readByte(), 0xFB);
      assert.equal(b.readByte(), 0xEA);
      assert.equal(b.readByte(), 0xEB);
      assert.equal(b.readByte(), 0xFC);
      assert.equal(b.readByte(), 0xFD);
    });

    it('should writeData(UINT8) and readData(UINT8)', () => {
      const b = new ByteList();
      b.writeData(DataTypes.UINT8, 0x1A);
      b.writeData(DataTypes.UINT8, 0x1B);
      b.writeData(DataTypes.UINT8, 0x1C);
      b.writeData(DataTypes.UINT8, 0x1D);

      b.index = 0
      assert.equal(b.readData(DataTypes.UINT8), 0x1A);
      assert.equal(b.readData(DataTypes.UINT8), 0x1B);
      assert.equal(b.readData(DataTypes.UINT8), 0x1C);
      assert.equal(b.readData(DataTypes.UINT8), 0x1D);
    });

    it('should writeData(INT8) and readData(INT8)', () => {
      const b = new ByteList();
      b.writeData(DataTypes.INT8, 0x2A);
      b.writeData(DataTypes.INT8, 0x2B);
      b.writeData(DataTypes.INT8, 0x2C);
      b.writeData(DataTypes.INT8, 0x2D);

      b.index = 0
      assert.equal(b.readData(DataTypes.INT8), 0x2A);
      assert.equal(b.readData(DataTypes.INT8), 0x2B);
      assert.equal(b.readData(DataTypes.INT8), 0x2C);
      assert.equal(b.readData(DataTypes.INT8), 0x2D);
    });

    it('should writeByte(char)', () => {
      const b = new ByteList();
      b.writeByte('A');
      b.writeByte('B');
      b.writeByte('C');
      assert.equal(b.index, 3);
      b.index = 0;
      assert.equal(b.readByte(), 'A'.charCodeAt(0));
      assert.equal(b.readByte(), 'B'.charCodeAt(0));
      assert.equal(b.readByte(), 'C'.charCodeAt(0));
    });

    it('should writeBool(), writeData(BOOL), readBool(), and readData(BOOL)', () => {
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

      b.index = 0;
      b.writeData(DataTypes.BOOL, false);
      b.writeData(DataTypes.BOOL, true);
      b.writeData(DataTypes.BOOL, false);
      b.writeData(DataTypes.BOOL, true);

      b.index = 0;
      assert(!b.readData(DataTypes.BOOL));
      assert(b.readData(DataTypes.BOOL));
      assert(!b.readData(DataTypes.BOOL));
      assert(b.readData(DataTypes.BOOL));
    });

    it('Should writeInt8() positive', () => {
      const b = new ByteList();

      b.writeInt8(120);
      b.writeInt8(127);
      assert.equal(b.length, 2);
      b.index = 0;
      assert.equal(b.readInt8(), 120);
      assert.equal(b.readInt8(), 127);
    });

    it('Should writeInt8() when byteList is constructed with other data', () => {
      const b = new ByteList(Buffer.from([1, 2]));
      assert.equal(b.index, 0);
      assert.equal(b.readByte(), 1);
      assert.equal(b.readByte(), 2);
      b.writeInt8(3);
      assert.equal(b.length, 3);
      b.index = 0;
      assert.equal(b.readByte(), 1);
      assert.equal(b.readByte(), 2);
      assert.equal(b.readInt8(), 3);
    });

    it('Should writeInt8() with options.insert', () => {
      const b = new ByteList(Buffer.from([1, 2]));
      assert.equal(b.index, 0);
      assert.equal(b.readByte(), 1);
      assert.equal(b.readByte(), 2);
      b.index = 1;
      b.writeInt8(3, { insert: true });
      b.index = 0;
      assert.equal(b.readByte(), 1);
      assert.equal(b.readInt8(), 3);
      assert.equal(b.readByte(), 2);
    });

    it('Should writeInt8() negative', () => {
      const b = new ByteList();
      b.writeInt8(-20);
      b.writeInt8(-120);
      b.index = 0;
      assert.equal(b.readInt8(), -20);
      assert.equal(b.readInt8(), -120);
    });

    it('Should writeInt8() negative with when byteList is constructed with other data', () => {
      const b = new ByteList(Buffer.from([1, 2, -20]));
      assert.equal(b.index, 0);
      assert.equal(b.readByte(), 1);
      assert.equal(b.readByte(), 2);
      assert.equal(b.readInt8(), -20);
      b.index = 2;
      b.writeInt8(-127, { insert: true });
      b.index = 0;
      assert.equal(b.readByte(), 1);
      assert.equal(b.readByte(), 2);
      assert.equal(b.readInt8(), -127);
      assert.equal(b.readInt8(), -20);
    });

    it('writeInt8() should throw range error', () => {
      const b = new ByteList();
      assert.throws(() => {
        b.writeInt8(129);
      });
      assert.throws(() => {
        b.writeInt8(-129);
      });
      b.writeInt8(127);
      b.writeInt8(-127);
      b.index = 0;
      assert.equal(b.readInt8(), 127);
      assert.equal(b.readInt8(), -127);
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
      for (let i = 0; i < 1000; i++) {
        c.writeData(DataTypes.INT16, i);
      }
      c.index = 0;
      for (let i = 0; i < 1000; i++) {
        assert.equal(c.readData(DataTypes.INT16), i);
      }

      const d = new ByteList();
      d.writeInt16(-1000);
      d.index = 0;
      assert.equal(d.readInt16(), -1000);

    });

    it('should writeInt32(), writeData(INT32), readInt32, readData(INT32)', () => {
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
      for (let i = 0; i < 1000; i++) {
        c.writeData(DataTypes.INT32, i);
      }
      c.index = 0;
      for (let i = 0; i < 1000; i++) {
        assert.equal(c.readData(DataTypes.INT32), i);
      }

      const d = new ByteList();
      d.writeInt32(-1000000);
      d.index = 0;
      assert.equal(d.readInt32(), -1000000);
    });

    it('should writeUInt16(), writeData(UINT16), readUInt16(), readData(UINT16)', () => {
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
      for (let i = 0; i < 1000; i++) {
        c.writeData(DataTypes.UINT16, i);
      }
      c.index = 0;
      for (let i = 0; i < 1000; i++) {
        assert.equal(c.readData(DataTypes.UINT16), i);
      }
    });

    it('should writeUInt32(), writeData(UINT32), readUInt32(), and readData(UINT32)', () => {
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
      for (let i = 0; i < 1000; i++) {
        c.writeData(DataTypes.UINT32, i);
      }
      c.index = 0;
      for (let i = 0; i < 1000; i++) {
        assert.equal(c.readData(DataTypes.UINT32), i);
      }
    });

    it('should writeFloat(), writeData(FLOAT), readFloat(), and readFloat(FLOAT)', () => {
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
      for (let i = 0; i < 1000; i++) {
        c.writeData(DataTypes.FLOAT, i);
      }
      c.index = 0;
      for (let i = 0; i < 1000; i++) {
        assert.equal(c.readData(DataTypes.FLOAT), i);
      }
    });

    it('should writeDouble(), writeData(DOUBLE), readDouble(), and readData(DOUBLE)', () => {
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
      for (let i = 0; i < 1000; i++) {
        c.writeData(DataTypes.DOUBLE, i);
      }
      c.index = 0;
      for (let i = 0; i < 1000; i++) {
        assert.equal(c.readData(DataTypes.DOUBLE), i);
      }
    });

    it('should writeDate(), writeData(DATE), readDate(), and readData(DATE)', () => {
      const date1 = new Date();
      const date2 = new Date();
      date2.setDate(date2.getDate() - 1);
      let bytes = new ByteList();
      bytes.writeDate(date1);
      bytes.index = 0;
      assert.equal(bytes.readDate()?.toString(), date1.toString());

      bytes.useLittleEndian = false;
      bytes.index = 0;
      bytes.writeDate(date2, {
        insert: true
      });
      bytes.index = 0;
      assert.equal(bytes.readDate()?.toString(), date2.toString());

      const currentDate = new Date();
      const testDate = new Date();
      bytes = new ByteList();
      for (let i = 0; i < 1000; i++) {
        testDate.setTime(currentDate.getTime() + i * 1000);
        bytes.writeData(DataTypes.DATE, testDate);
      }
      bytes.index = 0;
      for (let i = 0; i < 1000; i++) {
        testDate.setTime(currentDate.getTime() + i * 1000);
        assert.equal(bytes.readData(DataTypes.DATE)?.toString(), testDate.toString());
      }
    });

    it('Should be able to write date after other data', () => {
      const bytes = new ByteList();
      bytes.writeByte(1);
      bytes.writeByte(2);
      bytes.writeByte(3);
      bytes.writeByte(4);
      const testDate = new Date();
      bytes.writeDate(testDate);
      bytes.writeByte(5);
      bytes.writeByte(6);

      bytes.index = 0;
      assert.equal(bytes.readByte(), 1);
      assert.equal(bytes.readByte(), 2);
      assert.equal(bytes.readByte(), 3);
      assert.equal(bytes.readByte(), 4);
      assert.equal(bytes.readDate()?.toString(), testDate.toString());
      assert.equal(bytes.readByte(), 5);
      assert.equal(bytes.readByte(), 6);
    });

    it('should writeString(), writeData(STRING), readString(), and readData(STRING)', () => {
      const b = new ByteList();
      b.writeString('Testing');
      b.index = 0;
      assert.equal(b.readString(), 'Testing');

      let c = new ByteList();
      for (let i = 0; i < 100; i++) {
        c.writeData(DataTypes.STRING, 'This is a test');
      }
      c.index = 0;
      for (let i = 0; i < 100; i++) {
        assert.equal(c.readData(DataTypes.STRING), 'This is a test');
      }

      c = new ByteList();
      c.writeString();
      c.index = 0;
      assert.equal(c.readString(), '');

      c = new ByteList();
      c.writeString('123', { length: 7 });
      c.index = 0;
      assert.equal(c.readString({ length: 7 }), '123');

      c = new ByteList();
      c.writeString('123456789', { length: 5 });
      c.writeString('987654321', { length: 3 });
      c.index = 0;
      assert.equal(c.readString({ length: 5 }), '12345');
      assert.equal(c.readString({ length: 3 }), '987');

    });

    it('should writeByteArray(), writeData(BYTE_ARRAY), readByteArray(), and readData(BYTE_ARRAY)', () => {
      const b = new ByteList();

      let testData = [0x11, 0x22, 0x33, 0x44]
      b.writeByteArray(testData);
      b.index = 0;
      expect(b.readByteArray()).to.eql([0x11, 0x22, 0x33, 0x44]);

      b.index = 0;
      b.writeByteArray([], {});
      b.index = 0;
      assert.equal(b.readByteArray().length, 0);

      testData = [];
      for (let i = 0; i < 255; i++) {
        testData.push(i & 255);
      }
      b.index = 0;
      b.writeData(DataTypes.BYTE_ARRAY, testData);
      b.index = 0;
      expect(b.readData(DataTypes.BYTE_ARRAY)).to.eql(testData);

    });

  });

  describe('Get Bits', () => {
    it('Should throw an error on get bits if it\'s beyond the buffer', () => {
      const bytes = new ByteList();
      assert.throws(() => bytes.peekBits(0, 8));

      bytes.writeByte(1);
      bytes.index = 0;
      assert.throws(() => bytes.peekBits(8, 2));

      assert.throws(() => bytes.peekBits(8, 33)); // We only allow 32 bit precision
    });

    it('Get Bits', () => {
      const bytes = new ByteList();
      bytes.writeUInt32(0xFF00FF00);
      bytes.writeUInt16(0x00FF);
      bytes.index = 0;

      assert.equal(bytes.peekBits(24, 16), 0xFFFF);
      assert.equal(bytes.peekBits(0, 16), 0xFF00);
      assert.equal(bytes.peekBits(28, 8), 0xFF);
      assert.equal(bytes.peekBits(47, 8), 0); // Just barely, technically we shouldn't have 8 bits, only 1, but it's just padded
      assert.throws(() => bytes.peekBits(48, 8));
      assert.equal(bytes.index, 0); // Doesn't actually read off the bytes
    });

    it('Should get tricky bits', () => { // Needing the 5th byte
      const bytes = new ByteList([0, 0, 0, 0, 0, 0, 128, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 255, 255, 127, 1]);
      assert.equal(bytes.peekBits(54, 27), 0x3FFFFFE);
      assert.equal(bytes.peekBits(135, 27), 0x2FFFFFE);
    });
  });

  describe('Trim Methods', () => {
    it('should trimLeft()', () => {
      let bytes = new ByteList([1, 2, 3, 4]);
      assert.equal(bytes.index, 0);
      assert.equal(bytes.length, 4);
      let trimmedOffBytes = bytes.trimLeft(1);
      assert(trimmedOffBytes);
      assert.equal(trimmedOffBytes?.length, 1);
      assert.equal(trimmedOffBytes?.readInt8(0), 1);
      assert.equal(bytes.index, 0);
      assert.equal(bytes.length, 3);
      bytes.index = 0;
      assert.equal(bytes.peekByte(), 2);

      trimmedOffBytes = bytes.trimLeft(4);
      assert.equal(trimmedOffBytes?.length, 3);
      assert.equal(trimmedOffBytes?.readInt8(0), 2);
      assert.equal(trimmedOffBytes?.readInt8(1), 3);
      assert.equal(trimmedOffBytes?.readInt8(2), 4);
      assert.equal(bytes.index, 0);
      assert.equal(bytes.length, 0);

      bytes = new ByteList([1, 2, 3, 4, 5, 6]);
      bytes.index = 2;
      trimmedOffBytes = bytes.trimLeft(1);
      assert.equal(trimmedOffBytes?.length, 1);
      assert.equal(trimmedOffBytes?.readInt8(0), 1);
      assert.equal(bytes.index, 1);
      assert.equal(bytes.length, 5);

      bytes.index = 2;
      trimmedOffBytes = bytes.trimLeft(3);
      assert.equal(trimmedOffBytes?.length, 3);
      assert.equal(trimmedOffBytes?.readInt8(0), 2);
      assert.equal(trimmedOffBytes?.readInt8(1), 3);
      assert.equal(trimmedOffBytes?.readInt8(2), 4);
      assert.equal(bytes.index, 0);
      assert.equal(bytes.length, 2);

      bytes.index = 0;
      trimmedOffBytes = bytes.trimLeft(0);
      assert.equal(trimmedOffBytes?.length, 0);
      assert.equal(bytes.index, 0);
      assert.equal(bytes.length, 2);

      trimmedOffBytes = bytes.trimLeft(-1);
      assert.equal(trimmedOffBytes?.length, 0);
      assert.equal(bytes.index, 0);
      assert.equal(bytes.length, 2);

      bytes = new ByteList([]);
      trimmedOffBytes = bytes.trimLeft(2);
      assert.equal(trimmedOffBytes?.length, 0);
      assert.equal(bytes.index, 0);
      assert.equal(bytes.length, 0);
    });

    it('should trimRight()', () => {
      let bytes = new ByteList([1, 2, 3, 4]);
      let trimmedOffBytes = bytes.trimRight(1);
      assert.equal(trimmedOffBytes?.length, 1);
      assert.equal(trimmedOffBytes?.readInt8(0), 4);
      assert.equal(bytes.length, 3);

      bytes.index = 2;
      trimmedOffBytes = bytes.trimRight(2);
      assert.equal(trimmedOffBytes?.length, 2);
      assert.equal(trimmedOffBytes?.readInt8(0), 2);
      assert.equal(trimmedOffBytes?.readInt8(1), 3);
      assert.equal(bytes.length, 1);
      assert.equal(bytes.index, 1);

      bytes = new ByteList([1, 2, 3, 4, 5, 6]);
      assert.equal(bytes.index, 0);
      assert.equal(bytes.length, 6);

      bytes.trimRight(0);
      trimmedOffBytes = bytes.trimRight(0);
      assert.equal(trimmedOffBytes?.length, 0);
      assert.equal(bytes.index, 0);
      assert.equal(bytes.length, 6);

      bytes.trimRight(-1);
      assert.equal(trimmedOffBytes?.length, 0);
      assert.equal(bytes.index, 0);
      assert.equal(bytes.length, 6);

      trimmedOffBytes = bytes.trimRight(7);
      assert.equal(trimmedOffBytes?.length, 6);
      assert.equal(bytes.index, 0);
      assert.equal(bytes.length, 0);

      bytes = new ByteList([]);
      assert.equal(bytes.index, 0);
      assert.equal(bytes.length, 0);

      trimmedOffBytes = bytes.trimRight(7);
      assert.equal(trimmedOffBytes?.length, 0);
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

  describe('Exceptions thrown by readString', () => {

    it('Expect an exception if the ByteList does not have a string length', () => {
      let bytes = new ByteList([1]);
      assert.throws(() => { bytes.readString(); }, Error, 'Buffer Overrun')
      bytes = new ByteList([3, 0, 65]);
      assert.throws(() => { bytes.readString(); }, Error, 'Buffer Overrun')

    });

  });

  describe('toString()', () => {

    it('Should be toString() for an empty ByteList', () => {
      let expected = '';
      for (let i = 0; i < 100; i++) {
        expected += '0 ';
      }
      const bytes = new ByteList();
      assert.equal(bytes.toString(), expected);
    });

    it('Should be toString() for non-empty ByteList', () => {
      let expected = '3 0 41 42 43 ';
      for (let i = 0; i < 95; i++) {
        expected += '0 ';
      }
      const bytes = new ByteList('ABC');
      assert.equal(bytes.toString(), expected);
    });
  });

});
