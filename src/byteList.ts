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
    if (bit < 0 || bit > 31) {
      return num >>> 0;
    }
    if (val) {
      num |= 1 << bit;
    } else {
      num &= ~(1 << bit);
    }
    return num >>> 0;
  }

  public static GetBit(num: number, bit: number): boolean {
    if (bit < 0 || bit > 31) {
      return false;
    }
    return (num & (1 << bit)) != 0
  }

  public index: number;
  public useLittleEndian: boolean = true;
  public get length() { return this._length; }
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
    this._buffer = Buffer.alloc(this._paddingSize);
    if (typeof bytes === 'string' || bytes instanceof String) {
      this.writeString(bytes as string);
    } else if (bytes) {
      this.concat(bytes);
    }
    this.index = 0;
    return this;
  }

  public getBuffer() {
    return this._buffer.slice(0, this._length);
  }

  public getLength() {
    return this._length;
  }

  public concat(bytes: ArrayBuffer | Buffer | ByteList | number[]) {
    let length = 0;
    let buffer: Uint8Array | number[] | null = null;
    if (bytes instanceof ArrayBuffer) {
      buffer = new Uint8Array(bytes);
      length = buffer.length;
    } else if (bytes instanceof ByteList) {
      buffer = bytes.getBuffer();
      length = bytes.length;
    } else {
      buffer = bytes;
      length = bytes.length;
    }
    if (buffer && buffer.length) {
      this.prepareBuffer(length);
      for (let i = 0; i < length; i++) {
        if (this.index === this._length) {
          this.index++;
        }
        this._buffer.writeUInt8(buffer[i] & 0xFF, this._length++);
      }
    }

  }

  public insert(buffer) {
    if (buffer instanceof ByteList) {
      buffer = buffer.getBuffer();
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


  public peekUInt32(offset: number = 0) {
    if (this.length < this.index + offset + 4) {
      throw new Error('Buffer Overrun');
    }
    if (this.useLittleEndian) {
      return this._buffer.readUInt32LE(this.index + offset);
    } else {
      return this._buffer.readUInt32BE(this.index + offset);
    }
  }

  public writeByte(byte, options: any = {}) {
    if (typeof byte === 'string' && byte.length === 1) {
      byte = byte.charCodeAt(0);
    }
    this.prepareBuffer(1);
    const buf = options.insert ? Buffer.alloc(1) : this._buffer;
    buf.writeUInt8(!byte || byte < 0 ? 0 : byte & 0xFF, options.insert ? 0 : this.index);
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
    const buf = options.insert ? Buffer.alloc(2) : this._buffer;
    if (this.useLittleEndian) {
      buf.writeInt16LE(!int16 ? 0 : int16 & 0xFFFF, options.insert ? 0 : this.index);
    } else {
      buf.writeInt16BE(!int16 ? 0 : int16 & 0xFFFF, options.insert ? 0 : this.index);
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
    const buf = options.insert ? Buffer.alloc(4) : this._buffer;
    if (this.useLittleEndian) {
      buf.writeInt32LE(!int32 ? 0 : (int32 & 0xFFFFFFFF) >>> 0, options.insert ? 0 : this.index);
    } else {
      buf.writeInt32BE(!int32 ? 0 : (int32 & 0xFFFFFFFF) >>> 0, options.insert ? 0 : this.index);
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
    const buf = options.insert ? Buffer.alloc(2) : this._buffer;
    if (this.useLittleEndian) {
      buf.writeUInt16LE(!uint16 ? 0 : uint16 & 0xFFFF, options.insert ? 0 : this.index);
    } else {
      buf.writeUInt16BE(!uint16 ? 0 : uint16 & 0xFFFF, options.insert ? 0 : this.index);
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
    const buf = options.insert ? Buffer.alloc(4) : this._buffer;
    if (this.useLittleEndian) {
      buf.writeUInt32LE(!uint32 ? 0 : (uint32 & 0xFFFFFFFF) >>> 0, options.insert ? 0 : this.index);
    } else {
      buf.writeUInt32BE(!uint32 ? 0 : (uint32 & 0xFFFFFFFF) >>> 0, options.insert ? 0 : this.index);
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
    const buf = options.insert ? Buffer.alloc(8) : this._buffer;
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
    const buf = options.insert ? Buffer.alloc(8) : this._buffer;
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
    const buffer = options.insert ? Buffer.alloc(6) : this._buffer;
    buffer.writeUInt8(!date ? 0 : (date.getUTCFullYear() - 2000) & 0xFF, options.insert ? 0 : this.index++);
    buffer.writeUInt8(!date ? 0 : date.getUTCMonth() & 0xFF, options.insert ? 1 : this.index++);
    buffer.writeUInt8(!date ? 0 : date.getUTCDate() & 0xFF, options.insert ? 2 : this.index++);
    buffer.writeUInt8(!date ? 0 : date.getUTCHours() & 0xFF, options.insert ? 3 : this.index++);
    buffer.writeUInt8(!date ? 0 : date.getUTCMinutes() & 0xFF, options.insert ? 4 : this.index++);
    buffer.writeUInt8(!date ? 0 : date.getUTCSeconds() & 0xFF, options.insert ? 5 : this.index++);

    if (options.insert) {
      this.insert(buffer);
    } else {
      this._length += 6;
    }
  }

  public writeString(str: string = '', options: { insert?: boolean, length?: number } = {}) {
    if (!options.length) {
      const buf = Buffer.from(str, 'ascii');
      this.writeUInt16(buf.length, options);
      this.concat(buf);
    } else {
      const buf = Buffer.from(str.length > options.length ? str.substr(0, options.length) : str, 'ascii');
      console.log(buf);
      this.concat(buf);
      for (let i = 0; i < options.length - str.length; i++) {
        this.writeByte(0);
      }
    }
  }

  public writeByteArray(list, options) {
    this.writeByte(list ? list.length : 0, options);
    (list || []).forEach((l) => {
      this.writeByte(l, options);
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
      const year = this.readByte() + 2000;
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
    if (this.length < this.index + count) {
      throw new Error('Buffer Overrun');
    }

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

    const str = this._buffer.toString('ascii', this.index, this.index + length).replace(/\0/g, '');
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
      this._buffer = Buffer.concat([this._buffer, Buffer.alloc(this._paddingSize + length)], this._buffer.length + this._paddingSize + length);
    }
  }

}
