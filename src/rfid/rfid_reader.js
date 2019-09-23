import gpio from 'rpi-gpio';
import { promise as gpiop } from 'rpi-gpio';
import NanoTimer from 'nanotimer';
import _ from 'lodash';

import { rfidReader as config } from 'config';
import BusKeeper from '../bus_keeper';
import RfidBuffer from './rfid_buffer';

const MS_TO_NS = BigInt(1e6);
const READ_TIMEOUT_NS = BigInt(config.readTimeoutMs) * MS_TO_NS;

const DATA_MAPPING = {
  [config.pins.data0]: 0,
  [config.pins.data1]: 1,
}

export default class RfidReader {
  lastReadAt;
  index;
  data;
  greenLedPin;
  redLedPin;

  #bus;
  #authorizerBus;
  #dataTimer;
  #ledTimer;
  #rfidBuffer;

  constructor() {
    this.#bus = BusKeeper.rfidReader;
    this.#authorizerBus = BusKeeper.authorizer;
    this.#dataTimer = new NanoTimer();
    this.#ledTimer = new NanoTimer();
    this.#rfidBuffer = new RfidBuffer(this);
  }

  async start() {
    console.log("RFID Reader Start:", config.pins);
    await this.#setupGpio(config.pins);
    this.#authorizerBus.on('authorized', this.#handleAuthorized.bind(this));
    this.#authorizerBus.on('unauthorized', this.#handleUnauthorized.bind(this));
    this.#dataTimer.setInterval(this.#check.bind(this), [], config.pollTimeout);
  }

  #setupGpio = async (pins) => {
    gpio.setMode(gpio.MODE_BCM);
    await this.#setupReader(pins);
    await this.#setupOutputPins(pins);
  }

  #setupReader = async (pins) => {
    this.resetData();
    gpio.on('change', (channel, _value) => {
      this.lastReadAt = process.hrtime.bigint();
      this.data[this.index] = channel;
      this.index++;
    });
    gpio.setup(pins.data0, gpio.DIR_IN, gpio.EDGE_FALLING);
    gpio.setup(pins.data1, gpio.DIR_IN, gpio.EDGE_FALLING);
  }

  #setupOutputPins = async (pins) => {
    this.greenLedPin = pins.greenLed
    this.redLedPin = pins.redLed;
    await gpiop.setup(this.greenLedPin, gpio.DIR_HIGH);
    await gpiop.setup(this.redLedPin, gpio.DIR_HIGH);
  }

  resetData() {
    this.index = 0;
    this.data = new Array(100);
    this.lastReadAt = null;
  }

  handleSubmitBuffer(type, data) {
    this.bus.emit('read', type, data);
  }

  async handleClearBuffer() {
    await this.#clearLeds();
  }

  #check = () => {
    if (this.lastReadAt) {

      const now = process.hrtime.bigint();
      if ((now - this.lastReadAt) < READ_TIMEOUT_NS) return;
      let data = _.map(this.data, (value) => { return DATA_MAPPING[value]; });
      this.resetData();
      this.#rfidBuffer.read(data.join(''));
    }
  }

  #clearLeds = async () => {
    await gpiop.write(this.greenLedPin, true);
    await gpiop.write(this.redLedPin, true);
  };

  async processing() {
    this.#ledTimer.clearTimeout();
    await gpiop.write(this.greenLedPin, false);
    await gpiop.write(this.redLedPin, false);
    this.#ledTimer.setTimeout(this.clearLeds.bind(this), [], config.authLedTimeout);
  }

  #handleAuthorized = async (_credential) => {
    this.#ledTimer.clearTimeout();
    await gpiop.write(this.greenLedPin, false);
    await gpiop.write(this.redLedPin, true);
    this.#ledTimer.setTimeout(this.#clearLeds.bind(this), [], config.authLedTimeout);
  };

  #handleUnauthorized = async (_type, _value) => {
    this.#ledTimer.clearTimeout();
    await gpiop.write(this.greenLedPin, true);
    await gpiop.write(this.redLedPin, false);
    this.#ledTimer.setTimeout(this.#clearLeds.bind(this), [], config.authLedTimeout);
  };
}
