import { forEach, padEnd, isString } from 'lodash';
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

  public static SetBit(num: number, val: boolean, bit: number): number {
    if (val) {
      num |= 1 << bit;
    } else {
      num &= ~(1 << bit);
    }
    return num;
  }

  public static GetBit(num: number, bit: number): boolean {
    return (num & (1 << bit)) != 0
  }

  public index: number;
  public useLittleEndian: boolean = true;
  public get length() { return this._length; }
  public get buffer() { return this.getBuffer(); }
  public get paddingSize() { return this._paddingSize; }
  public set paddingSize(val: number) {
    this._paddingSize = val;
    if (this._paddingSize < 0) {
      this._paddingSize = 0;
    }
  }

  private _paddingSize = 100;
  private _length: number;
  private _buffer: Buffer;

  constructor(bytes?: any) {
    this.index = 0;
    this._length = 0;
    this._buffer = new Buffer(this._paddingSize);
    if (isString(bytes)) {
      this.writeString(bytes);
    } else if (bytes) {
      this.concat(bytes);
    }
  }

  public getBuffer() {
    return new Buffer(this._buffer.buffer, 0, this._length);
  }

  public getLength() {
    return this._length;
  }

  public concat(buffer) {
    if (buffer && buffer.buffer && buffer.buffer instanceof Uint8Array) {
      buffer = buffer.buffer;
    }
    this.prepareBuffer(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      this._buffer.writeUInt8(buffer[i], this._length++);
    }
  }

  public insert(buffer) {
    if (buffer instanceof ByteList) {
      buffer = buffer._buffer;
    }

    const part1 = this._buffer.slice(0, this.index);
    const part2 = this._buffer.slice(this.index, this._buffer.length);

    this._buffer = Buffer.concat([part1, buffer, part2], (part1.length + buffer.length + part2.length));
    this.index += buffer.length;
    this._length += buffer.length;
  }

  public peekByte(offset: number = 0) {
    if (this.length < this.index + offset + 1) {
      throw new Error('Buffer Overrun');
    }
    return this._buffer.readUInt8(this.index + offset);
  }

  public peekUInt16(offset: number = 0) {
    if (this.length < this.index + offset + 2) {
      throw new Error('Buffer Overrun');
    }
    if (this.useLittleEndian) {
      return this._buffer.readUInt16LE(this.index + offset);
    } else {
      return this._buffer.readUInt16BE(this.index + offset);
    }
  }

  public writeByte(byte, options: any = {}) {
    if (typeof byte === 'string' && byte.length === 1) {
      byte = byte.charCodeAt(0);
    }
    this.prepareBuffer(1);
    const buf = options.insert ? new Buffer(1) : this._buffer;
    buf.writeUInt8(!byte || byte < 0 ? 0 : byte, options.insert ? 0 : this.index);
    if (options.insert) {
      this.insert(buf);
    } else {
      this.index += 1;
      this._length += 1;
    }
  }

  public writeBool(bool: boolean, options: any = {}) {
    this.writeByte(bool ? 1 : 0, options);
  }

  public writeInt16(int16: number, options: any = {}) {
    this.prepareBuffer(2);
    const buf = options.insert ? new Buffer(2) : this._buffer;
    if (this.useLittleEndian) {
      buf.writeInt16LE(!int16 ? 0 : int16, options.insert ? 0 : this.index);
    } else {
      buf.writeInt16BE(!int16 ? 0 : int16, options.insert ? 0 : this.index);
    }
    if (options.insert) {
      this.insert(buf);
    } else {
      this.index += 2;
      this._length += 2;
    }
  }

  public writeInt32(int32: number, options: any = {}) {
    this.prepareBuffer(4);
    const buf = options.insert ? new Buffer(4) : this._buffer;
    if (this.useLittleEndian) {
      buf.writeInt32LE(!int32 ? 0 : int32, options.insert ? 0 : this.index);
    } else {
      buf.writeInt32BE(!int32 ? 0 : int32, options.insert ? 0 : this.index);
    }
    if (options.insert) {
      this.insert(buf);
    } else {
      this.index += 4;
      this._length += 4;
    }
  }

  public writeUInt16(uint16: number, options: any = {}) {
    this.prepareBuffer(2);
    const buf = options.insert ? new Buffer(2) : this._buffer;
    if (this.useLittleEndian) {
      buf.writeUInt16LE(!uint16 ? 0 : uint16, options.insert ? 0 : this.index);
    } else {
      buf.writeUInt16BE(!uint16 ? 0 : uint16, options.insert ? 0 : this.index);
    }
    if (options.insert) {
      this.insert(buf);
    } else {
      this.index += 2;
      this._length += 2;
    }
  }

  public writeUInt32(uint32: number, options: any = {}) {
    this.prepareBuffer(4);
    const buf = options.insert ? new Buffer(4) : this._buffer;
    if (this.useLittleEndian) {
      buf.writeUInt32LE(!uint32 ? 0 : uint32, options.insert ? 0 : this.index);
    } else {
      buf.writeUInt32BE(!uint32 ? 0 : uint32, options.insert ? 0 : this.index);
    }
    if (options.insert) {
      this.insert(buf);
    } else {
      this.index += 4;
      this._length += 4;
    }
  }

  public writeFloat(float: number, options: any = {}) {
    this.prepareBuffer(8);
    const buf = options.insert ? new Buffer(8) : this._buffer;
    if (this.useLittleEndian) {
      buf.writeFloatLE(!float ? 0 : float, options.insert ? 0 : this.index);
    } else {
      buf.writeFloatBE(!float ? 0 : float, options.insert ? 0 : this.index);
    }
    if (options.insert) {
      this.insert(buf);
    } else {
      this.index += 8;
      this._length += 8;
    }
  }

  public writeDouble(double: number, options: any = {}) {
    this.prepareBuffer(8);
    const buf = options.insert ? new Buffer(8) : this._buffer;
    if (this.useLittleEndian) {
      buf.writeDoubleLE(!double ? 0 : double, options.insert ? 0 : this.index);
    } else {
      buf.writeDoubleBE(!double ? 0 : double, options.insert ? 0 : this.index);
    }
    if (options.insert) {
      this.insert(buf);
    } else {
      this.index += 8;
      this._length += 8;
    }
  }

  public writeDate(date: Date, options: any = {}) {
    this.prepareBuffer(6);
    const buffer = options.insert ? new Buffer(6) : this._buffer;
    buffer.writeInt8(!date ? 0 : date.getUTCFullYear() - 2000, 0);
    buffer.writeInt8(!date ? 0 : date.getUTCMonth(), 1);
    buffer.writeInt8(!date ? 0 : date.getUTCDate(), 2);
    buffer.writeInt8(!date ? 0 : date.getUTCHours(), 3);
    buffer.writeInt8(!date ? 0 : date.getUTCMinutes(), 4);
    buffer.writeInt8(!date ? 0 : date.getUTCSeconds(), 5);

    if (options.insert) {
      this.insert(buffer);
    } else {
      this.index += 6;
      this._length += 6;
    }
  }

  public writeString(str: string = '', options: { insert?: boolean, length?: number } = {}) {
    str = !options.length ? str : (str.length > options.length ? str.substr(0, options.length) : padEnd(str, options.length, '\0'));
    const buf = new Buffer(str, 'utf-8');
    if (!options.length) {
      this.writeUInt16(buf.length, options);
    }
    if (options.insert) {
      this.insert(buf);
    } else {
      this.concat(buf);
    }
  }

  public writeByteArray(list, options) {
    this.writeByte(list ? list.length : 0, options);
    forEach(list, (l) => {
      list.forEach((l) => {
        this.writeByte(l, options);
      });
    });
  }

  public writeData(type: DataTypes, val?: any, options?: any) {
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
    const bytes = this._buffer.slice(0, count);
    this._buffer = this._buffer.slice(count, this._buffer.length);
    this.index = this.index - count;
    if (this.index < 0) {
      this.index = 0;
    }
    this._length -= count;
    if (this._length < 0) {
      this._length = 0;
    }
    return bytes;
  }

  public trimRight(count: number) {
    this.index -= count;
    if (this.index < 0) {
      this.index = 0;
    }
    this._length -= count;
    if (this._length < 0) {
      this._length = 0;
    }
  }

  public readByte(): number {
    if (this.length < this.index + 1) {
      throw new Error('Buffer Overrun');
    }
    const byte = this._buffer.readUInt8(this.index);
    this.index++;
    return byte;
  }

  public readInt8(): number {
    if (this.length < this.index + 1) {
      throw new Error('Buffer Overrun');
    }
    const byte = this._buffer.readInt8(this.index);
    this.index++;
    return byte;
  }

  public readBool(): boolean {
    return this.readByte() === 1;
  }

  public readInt16(): number {
    if (this.length < this.index + 2) {
      throw new Error('Buffer Overrun');
    }
    const val = this.useLittleEndian ? this._buffer.readInt16LE(this.index) : this._buffer.readInt16BE(this.index);
    this.index += 2;
    return val;
  }

  public readInt32(): number {
    if (this.length < this.index + 4) {
      throw new Error('Buffer Overrun');
    }
    const val = this.useLittleEndian ? this._buffer.readInt32LE(this.index) : this._buffer.readInt32BE(this.index);
    this.index += 4;
    return val;
  }

  public readUInt16(): number {
    if (this.length < this.index + 2) {
      throw new Error('Buffer Overrun');
    }
    const val = this.useLittleEndian ? this._buffer.readUInt16LE(this.index) : this._buffer.readUInt16BE(this.index);
    this.index += 2;
    return val;
  }

  public readUInt32(): number {
    if (this.length < this.index + 4) {
      throw new Error('Buffer Overrun');
    }
    const val = this.useLittleEndian ? this._buffer.readUInt32LE(this.index) : this._buffer.readUInt32BE(this.index);
    this.index += 4;
    return val;
  }

  public readFloat(): number {
    if (this.length < this.index + 8) {
      throw new Error('Buffer Overrun');
    }
    const val = this.useLittleEndian ? this._buffer.readFloatLE(this.index) : this._buffer.readFloatBE(this.index);
    this.index += 8;
    return val;
  }

  public readDouble(): number {
    if (this.length < this.index + 8) {
      throw new Error('Buffer Overrun');
    }
    const val = this.useLittleEndian ? this._buffer.readDoubleLE(this.index) : this._buffer.readDoubleBE(this.index);
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
    const bytes = this._buffer.slice(this.index, this.index + count);
    this.index += count;
    return bytes;
  }

  public readString(options: { length?: number } = {}): string {
    if (this.length < this.index + 2) {
      throw new Error('Buffer Overrun');
    }

    const length = options.length || this.readUInt16();
    if (this.length < this.index + length) {
      throw new Error('Buffer Overrun');
    }

    const str = this._buffer.toString('utf-8', this.index, this.index + length);
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

  public readData(type: DataTypes, options: any = {}): any {
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
        return this.readString(options);
      case DataTypes.BYTE_ARRAY:
        return this.readByteArray();
    }
  }

  public toString() {
    let str = '';
    for (const byte of (this._buffer as any)) {
      str += byte.toString(16).toUpperCase() + ' ';
    }
    return str;
  }

  private prepareBuffer(length: number) {
    const spaceLeft = this._buffer.length - this.length;
    if (length > spaceLeft) {
      this._buffer = Buffer.concat([this._buffer, new Buffer(this._paddingSize + length)], this._buffer.length + this._paddingSize + length);
    }
  }

}
