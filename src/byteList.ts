const Buffer = require('buffer/').Buffer;

export enum DataTypes {
  BYTE,
  BOOL,
  INT8,
  INT16,
  INT32,
  UINT8,
  UINT16,
  UINT32,
  FLOAT,
  DOUBLE,
  DATE,
  STRING,
  BYTE_ARRAY,
}

export class ByteList {

  public static WriteByte(byte, options: any = {}) {
    const buf = new Buffer(1);
    if (typeof byte === 'string' && byte.length === 1) {
      byte = byte.charCodeAt(0);
    }
    buf.writeUInt8(!byte || byte < 0 ? 0 : byte, 0);
    return buf;
  }


  public buffer: Buffer;
  public index: number;
  public useLittleEndian: boolean = true;

  constructor(bytes?: any) {

    const type: any = typeof bytes;
    if (!bytes) {
      this.buffer = new Buffer(0);
    } else if (typeof bytes === 'string') {
      this.buffer = new Buffer(0);
      this.writeString(bytes);
    } else {
      this.buffer = new Buffer(bytes);
    }

    this.index = 0;
  }

  get length() {
    return this.buffer.length;
  }

  public getBuffer() {
    return this.buffer;
  }

  public getLength() {
    return this.buffer.length;
  }

  public concat(buffer) {
    if (buffer instanceof ByteList) {
      buffer = buffer.buffer;
    }
    this.buffer = Buffer.concat([this.buffer, buffer], (this.buffer.length + buffer.length));
    this.index += buffer.length;
  }

  public insert(buffer) {
    if (buffer instanceof ByteList) {
      buffer = buffer.buffer;
    }

    const part1 = this.buffer.slice(0, this.index);
    const part2 = this.buffer.slice(this.index, this.buffer.length);

    this.buffer = Buffer.concat([part1, buffer, part2], (part1.length + buffer.length + part2.length));
    this.index += buffer.length;
  }

  public peekByte(offset: number = 0) {
    if (this.buffer.length < this.index + offset + 1) {
      console.log('Buffer Overrun');
    }
    return this.buffer.readUInt8(this.index + offset);
  }

  public peekUInt16(offset: number = 0) {
    if (this.buffer.length < this.index + offset + 2) {
      console.log('Buffer Overrun');
    }
    if (this.useLittleEndian) {
      return this.buffer.readUInt16LE(this.index + offset);
    } else {
      return this.buffer.readUInt16BE(this.index + offset);
    }
  }

  public writeByte(byte, options: any = {}) {
    const buf = new Buffer(1);
    if (typeof byte === 'string' && byte.length === 1) {
      byte = byte.charCodeAt(0);
    }
    buf.writeUInt8(!byte || byte < 0 ? 0 : byte, 0);
    if (options.insert) {
      this.insert(buf);
    } else {
      this.concat(buf);
    }
  }

  public writeBool(bool: boolean, options: any = {}) {
    this.writeByte(bool ? 1 : 0, options);
  }

  public writeInt16(int16: number, options: any = {}) {
    const buf = new Buffer(2);
    if (this.useLittleEndian) {
      buf.writeInt16LE(!int16 ? 0 : int16, 0);
    } else {
      buf.writeInt16BE(!int16 ? 0 : int16, 0);
    }

    if (options.insert) {
      this.insert(buf);
    } else {
      this.concat(buf);
    }
  }

  public writeInt32(int32: number, options: any = {}) {
    const buf = new Buffer(4);
    if (this.useLittleEndian) {
      buf.writeInt32LE(!int32 ? 0 : int32, 0);
    } else {
      buf.writeInt32BE(!int32 ? 0 : int32, 0);
    }

    if (options.insert) {
      this.insert(buf);
    } else {
      this.concat(buf);
    }
  }

  public writeUInt16(uint16: number, options: any = {}) {
    const buf = new Buffer(2);
    if (this.useLittleEndian) {
      buf.writeUInt16LE(!uint16 || uint16 < 0 ? 0 : uint16, 0);
    } else {
      buf.writeUInt16BE(!uint16 || uint16 < 0 ? 0 : uint16, 0);
    }

    if (options.insert) {
      this.insert(buf);
    } else {
      this.concat(buf);
    }
  }

  public writeUInt32(uint32: number, options: any = {}) {
    const buf = new Buffer(4);
    if (this.useLittleEndian) {
      buf.writeUInt32LE(!uint32 || uint32 < 0 ? 0 : uint32, 0);
    } else {
      buf.writeUInt32BE(!uint32 || uint32 < 0 ? 0 : uint32, 0);
    }

    if (options.insert) {
      this.insert(buf);
    } else {
      this.concat(buf);
    }
  }

  public writeFloat(float: number, options: any = {}) {
    const buf = new Buffer(8);
    if (this.useLittleEndian) {
      buf.writeFloatLE(!float ? 0 : float, 0);
    } else {
      buf.writeFloatBE(!float ? 0 : float, 0);
    }

    if (options.insert) {
      this.insert(buf);
    } else {
      this.concat(buf);
    }
  }

  public writeDouble(double: number, options: any = {}) {
    const buf = new Buffer(8);
    if (this.useLittleEndian) {
      buf.writeDoubleLE(!double ? 0 : double, 0);
    } else {
      buf.writeDoubleBE(!double ? 0 : double, 0);
    }

    if (options.insert) {
      this.insert(buf);
    } else {
      this.concat(buf);
    }
  }

  public writeDate(date: Date, options: any = {}) {
    const buffer = new Buffer(6);
    buffer.writeInt8(!date ? 0 : date.getUTCFullYear() - 2000, 0);
    buffer.writeInt8(!date ? 0 : date.getUTCMonth(), 1);
    buffer.writeInt8(!date ? 0 : date.getUTCDate(), 2);
    buffer.writeInt8(!date ? 0 : date.getUTCHours(), 3);
    buffer.writeInt8(!date ? 0 : date.getUTCMinutes(), 4);
    buffer.writeInt8(!date ? 0 : date.getUTCSeconds(), 5);

    if (options.insert) {
      this.insert(buffer);
    } else {
      this.concat(buffer);
    }
  }

  public writeString(str: string = '', options: any = {}) {
    const buf = new Buffer(str, 'utf-8');
    const bytes = new ByteList();
    bytes.useLittleEndian = this.useLittleEndian;
    bytes.writeUInt16(buf.length);
    bytes.concat(buf);

    if (options.insert) {
      this.insert(bytes.getBuffer());
    } else {
      this.concat(bytes.getBuffer());
    }
  }

  public writeByteArray(list, options) {
    this.writeByte(list.length, options);
    list.forEach((l) => {
      this.writeByte(l, options);
    });
  }

  public writeData(type: DataTypes, val: any, options?: any) {
    switch (type) {
      case DataTypes.BYTE:
        this.writeByte(val, options);
        break;
      case DataTypes.BOOL:
        this.writeBool(val, options);
        break;
      case DataTypes.INT8:
        this.writeByte(val, options);
        break;
      case DataTypes.INT16:
        this.writeInt16(val, options);
        break;
      case DataTypes.INT32:
        this.writeInt32(val, options);
        break;
      case DataTypes.UINT8:
        this.writeByte(val, options);
        break;
      case DataTypes.UINT16:
        this.writeUInt16(val, options);
        break;
      case DataTypes.UINT32:
        this.writeUInt32(val, options);
        break;
      case DataTypes.FLOAT:
        this.writeFloat(val, options);
        break;
      case DataTypes.DOUBLE:
        this.writeDouble(val, options);
        break;
      case DataTypes.DATE:
        this.writeDate(val, options);
        break;
      case DataTypes.STRING:
        this.writeString(val, options);
        break;
      case DataTypes.BYTE_ARRAY:
        this.writeByteArray(val, options);
        break;
    }
  }

  public trimLeft(count: number) {
    const bytes = this.buffer.slice(0, count);
    this.buffer = this.buffer.slice(count, this.buffer.length);
    this.index = this.index - count;
    if (this.index < 0) {
      this.index = 0;
    }
    return bytes;
  }

  public trimRight(count: number) {
    if (count >= this.buffer.length) {
      this.buffer = new Buffer(0);
      this.index = 0;
    } else {
      this.buffer = this.buffer.slice(0, this.buffer.length - count);
    }
  }

  public readByte(): number {
    if (this.buffer.length < this.index + 1) {
      console.log('Buffer Overrun');
    }
    const byte = this.buffer.readUInt8(this.index);
    this.index++;
    return byte;
  }

  public readInt8(): number {
    if (this.buffer.length < this.index + 1) {
      console.log('Buffer Overrun');
    }
    const byte = this.buffer.readInt8(this.index);
    this.index++;
    return byte;
  }

  public readBool(): boolean {
    return this.readByte() === 1;
  }

  public readInt16(): number {
    if (this.buffer.length < this.index + 2) {
      console.log('Buffer Overrun');
    }
    const val = this.useLittleEndian ? this.buffer.readInt16LE(this.index) : this.buffer.readInt16BE(this.index);
    this.index += 2;
    return val;
  }

  public readInt32(): number {
    if (this.buffer.length < this.index + 4) {
      console.log('Buffer Overrun');
    }
    const val = this.useLittleEndian ? this.buffer.readInt32LE(this.index) : this.buffer.readInt32BE(this.index);
    this.index += 4;
    return val;
  }

  public readUInt16(): number {
    if (this.buffer.length < this.index + 2) {
      console.log('Buffer Overrun');
    }
    const val = this.useLittleEndian ? this.buffer.readUInt16LE(this.index) : this.buffer.readUInt16BE(this.index);
    this.index += 2;
    return val;
  }

  public readUInt32(): number {
    if (this.buffer.length < this.index + 4) {
      console.log('Buffer Overrun');
    }
    const val = this.useLittleEndian ? this.buffer.readUInt32LE(this.index) : this.buffer.readUInt32BE(this.index);
    this.index += 4;
    return val;
  }

  public readFloat(): number {
    if (this.buffer.length < this.index + 8) {
      console.log('Buffer Overrun');
    }
    const val = this.useLittleEndian ? this.buffer.readFloatLE(this.index) : this.buffer.readFloatBE(this.index);
    this.index += 8;
    return val;
  }

  public readDouble(): number {
    if (this.buffer.length < this.index + 8) {
      console.log('Buffer Overrun');
    }
    const val = this.useLittleEndian ? this.buffer.readDoubleLE(this.index) : this.buffer.readDoubleBE(this.index);
    this.index += 8;
    return val;
  }

  public readDate(): Date | null {
    try {
      const year = this.readInt8() + 2000;
      const month = this.readByte();
      const day = this.readByte();
      const hour = this.readByte();
      const minute = this.readByte();
      const second = this.readByte();
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    } catch (e) {
      return null;
    }
  }

  public readBytes(count: number) {
    const bytes = this.buffer.slice(this.index, this.index + count);
    this.index += count;
    return bytes;
  }

  public readString(): string {
    if (this.buffer.length < this.index + 2) {
      console.log('Buffer Overrun');
    }

    const length = this.readUInt16();
    if (this.buffer.length < this.index + length) {
      console.log('Buffer Overrun');
    }

    const str = this.buffer.toString('utf-8', this.index, this.index + length);
    this.index += length;
    return str;
  }

  public readByteArray(): number[] {
    const array: number[] = [];
    const length = this.readByte();
    for (let i = 0; i < length; i++) {
      array.push(this.readByte());
    }
    return array;
  }

  public readData(type: DataTypes): any {
    switch (type) {
      case DataTypes.BYTE:
        return this.readByte();
      case DataTypes.BOOL:
        return this.readBool();
      case DataTypes.INT8:
        return this.readInt8();
      case DataTypes.INT16:
        return this.readInt16();
      case DataTypes.INT32:
        return this.readInt32();
      case DataTypes.UINT8:
        return this.readByte();
      case DataTypes.UINT16:
        return this.readUInt16();
      case DataTypes.UINT32:
        return this.readUInt32();
      case DataTypes.FLOAT:
        return this.readFloat();
      case DataTypes.DOUBLE:
        return this.readDouble();
      case DataTypes.DATE:
        return this.readDate();
      case DataTypes.STRING:
        return this.readString();
      case DataTypes.BYTE_ARRAY:
        return this.readByteArray();
    }
  }

}
