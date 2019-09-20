import NanoTimer from 'nanotimer';

import { KeyMapping } from './key_mapping';

const config = {
  wait_timeout: '1s',
  pin_key_timeout: '15s',
}

export default class RfidBuffer {
  static get TYPES() {
    return {
      PIN: 'PIN',
      RFID: 'RFID',
    };
  }

  constructor(rfidReader) {
    this.rfidReader = rfidReader;
    this.buffer = [];
    this.timer = new NanoTimer();
  }

  read(data) {
    if (data.length < 8) {
      this.reset(this);
    }
    else if (data.length === 8) {
      this.processKey(data);
    }
    else {
      this.processRfid(data);
    }
  }

  submitPin() {
    const bufferData = this.buffer.join('');
    this.reset(this);
    this.rfidReader.handleSubmitBuffer(RfidBuffer.TYPES.PIN, bufferData);
  }

  processKey(data) {
    const key = KeyMapping[data];
    switch (key) {
      case '#':
        this.submitPin();
        break;
      case '*':
        this.reset();
        break;
      default:
        this.addKey(key);
    }
  }

  addKey(key) {
    this.timer.clearTimeout();
    this.buffer.push(key);
    this.timer.setTimeout(this.reset, [this], config.pin_key_timeout);
  }

  processRfid(data) {
    this.rfidReader.handleSubmitBuffer(RfidBuffer.TYPES.RFID, data);
  }

  reset(context) {
    context.buffer = [];
    this.rfidReader.handleClearBuffer();
  }
}
