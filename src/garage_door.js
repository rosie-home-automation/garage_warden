import NanoTimer from 'nanotimer';
import gpio from 'rpi-gpio';
import { promise as gpiop } from 'rpi-gpio';
import _ from 'lodash';

import logger from './logger';
import { garageDoor as config } from 'config';
import BusKeeper from './bus_keeper';

export default class GarageDoor {
  #authorizerBus;
  #bus;
  #logger;
  #sensorTimer;

  constructor() {
    this.#logger = logger.child({ module: 'GarageDoor' });
    this.#bus = BusKeeper.garageDoor;
    this.#authorizerBus = BusKeeper.authorizer;
    this.#sensorTimer = new NanoTimer();
    this.isOpen = null;
  }

  async start() {
    this.#logger.debug('Garage Door Start', { pins: config.pins });
    await this.#setupGpio();
    const currentValue = await this.sensorValue();
    this.handleSensor(this._sensorPin, currentValue);
    gpio.on('change', this.handleSensor.bind(this));
    this.#bus.on('action', this.#handleAction);
    this.#authorizerBus.on('authorized', this.#handleAuthorized);
  }

  status() {
    return this.isOpen ? 'open' : 'closed';
  }

  async sensorValue() {
    return gpiop.read(this._sensorPin);
  }

  toggle() {
    this.#logger.info('Door toggled', { status: this.status() });
    gpio.write(this._doorSwitchPin, true);
    setTimeout(() => { gpio.write(this._doorSwitchPin, false); }, 200);
  }

  open() {
    if (!this.isOpen) this.toggle();
  }

  close() {
    if (this.isOpen) this.toggle();
  }

  #setupGpio = async () => {
    this._sensorPin = config.pins.sensor;
    this._statusOpenPin = config.pins.statusOpen;
    this._statusClosedPin = config.pins.statusClosed;
    this._doorSwitchPin = config.pins.doorSwitch;

    gpio.setMode(gpio.MODE_BCM);
    await gpiop.setup(this._sensorPin, gpio.DIR_IN, gpio.EDGE_BOTH);
    await gpiop.setup(this._statusOpenPin, gpio.DIR_OUT);
    await gpiop.setup(this._statusClosedPin, gpio.DIR_OUT);
    await gpiop.setup(this._doorSwitchPin, gpio.DIR_OUT);
  };

  handleSensor(_pin, value) {
    this.#sensorTimer.clearTimeout();
    this.#sensorTimer.setTimeout(this.verifySensor.bind(this), [value], '250m');
  }

  async verifySensor(value) {
    const currentValue = await this.sensorValue();
    if (value !== currentValue) return;
    if (this.isOpen !== value) {
      this.isOpen = value;
      this.#logger.info(`Door ${this.status()}`, { status: this.status() });
      this.#bus.emit('status', this.status(), this.isOpen);
    }
  }

  #handleAction = (action) => {
    switch (action) {
      case 'close':
        this.close();
        break;
      case 'open':
        this.open();
        break;
      case 'toggle':
        this.toggle();
        break;
    }
  };

  #handleAuthorized = (credential) => {
    this.toggle();
  };
}
