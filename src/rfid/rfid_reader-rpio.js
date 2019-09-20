import rpio from 'rpio';
import NanoTimer from 'nanotimer';

import BusKeeper from '../bus_keeper';
import RfidBuffer from './rfid_buffer';

const config = {
  pins: {
    data_0: 18,
    data_1: 23,
    greenLed: 24,
    redLed: 25,
  },
  data_timeout: '120m',
  auth_led_timeout: '1s',
};

const check = (context) => {
  let data = context.data;
  console.log("CHECK", context)
  context.resetData();

  context.rfidBuffer.read(data.join(''));
};

export default class RfidReader {
  constructor() {
    console.log('RfidReader: Starting...');
    this.bus = BusKeeper.rfidReader;
    this.rfidBuffer = new RfidBuffer(this);
    this.setupGpio(config.pins);
    console.log('RfidReader: Started');
  }

  setupGpio(pins) {
    rpio.init({ mapping: 'gpio' });
    this.setupReader(pins);
    this.setupOutputPins(pins);
  }

  setupReader(pins) {
    this.timer = new NanoTimer();
    this.resetData();
    this.setupDataPin(pins.data_0, 0);
    this.setupDataPin(pins.data_1, 1);
    console.log("Setup reader: ", pins);
  }

  setupDataPin(pinNumber, pinValue) {
    rpio.open(pinNumber, rpio.INPUT);
    rpio.poll(pinNumber, (_pin) => {
      this.data[this.index] = pinValue;
      this.index++;
      this.timer.clearTimeout();
      this.timer.setTimeout(check, [this], config.data_timeout);
    }, rpio.POLL_LOW);
  }

  setupOutputPins(pins) {
    this.greenLedPin = this.setupOutputPin(pins.greenLed);
    this.redLedPin = this.setupOutputPin(pins.redLed);
    rpio.write(this.greenLedPin, rpio.HIGH);
    rpio.write(this.redLedPin, rpio.HIGH);
  }

  setupOutputPin(pin) {
    rpio.open(pin, rpio.OUTPUT);
    return pin;
  }

  resetData() {
    this.index = 0;
    this.data = new Array(100);
  }

  handleBuffer(type, data) {
    this.bus.emit(`read.${type}`, type, data);
  }

  authorized() {
    rpio.write(this.greenLedPin, rpio.LOW);
    let timer = new NanoTimer();
    timer.setTimeout(() => rpio.write(this.greenLedPin, rpio.HIGH), [], config.auth_led_timeout);
  }

  unauthorized() {
    rpio.write(this.redLedPin, rpio.LOW);
    let timer = new NanoTimer();
    timer.setTimeout(() => {
      rpio.write(this.redLedPin, rpio.HIGH);
    }, [], config.auth_led_timeout);
  }
}
