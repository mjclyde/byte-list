# ByteList

[![Build Status](https://travis-ci.org/mjclyde/byte-list.svg?branch=master)](https://travis-ci.org/mjclyde/byte-list)

```sh
   $ npm install byte-list
```

## Usage

```javascript
const { ByteList } = require('byte-list');

const bytes = new ByteList();

const myNumber = 0xABCD1234;

console.log(myNumber);
// 2882343476   (0xABCD1234)

bytes.writeUInt32(myNumber);
bytes.index = 0;
console.log(bytes.readUInt32());
// 2882343476   (0xABCD1234)

bytes.index = 0;
console.log(bytes.readUInt16());
// 43981        (0xABCD)
console.log(bytes.readUInt16());
// 4660         (0x1234)

bytes.index = 0;
console.log(bytes.readByte());
// 171          (0xAB)
console.log(bytes.readByte());
// 205          (0xCD)
console.log(bytes.readByte());
// 18           (0x12)
console.log(bytes.readByte());
// 52           (0x34)
```