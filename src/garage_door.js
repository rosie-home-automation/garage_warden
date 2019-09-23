import gpio from 'rpi-gpio';
import { promise as gpiop } from 'rpi-gpio';
import _ from 'lodash';

import { garageDoor as config } from 'config';
import BusKeeper from './bus_keeper';

export default class GarageDoor {
  #authorizerBus;
  #bus;

  constructor() {
    this.#bus = BusKeeper.garageDoor;
    this.#authorizerBus = BusKeeper.authorizer;
    this.isOpen = null;
  }

  async start() {
    console.log("Garage Door Start:", config.pins);
    await this.#setupGpio();
    const currentValue = await gpiop.read(this._sensorPin)
    this.handleSensor(this._sensorPin, currentValue);
    gpio.on('change', this.handleSensor.bind(this));
    this.#bus.on('action', this.#handleAction);
    this.#authorizerBus.on('authorized', this.#handleAuthorized);
  }

  status() {
    return this.isOpen ? 'open' : 'closed';
  }

  toggle() {
    console.log('Door toggled')
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
    if (this.isOpen !== value) {
      this.isOpen = value;
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
