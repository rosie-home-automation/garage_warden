import { Gpio } from 'onoff';
import { EventEmitter } from 'events';
import _ from 'lodash';

const options = {
  pins: {
    sensor:       5,
    statusOpen:   27,
    statusClosed: 22,
    doorSwitch:   4
  }
}

let _garageDoor = null;

export default class GarageDoor extends EventEmitter {
  static garageDoor() {
    if (_garageDoor) return _garageDoor;
    _garageDoor = new GarageDoor();
    return _garageDoor;
  }

  constructor() {
    super();
    EventEmitter.call(this);
    this.isOpen = null;
    this.setupGpio();
  }

  setupGpio() {
    this._sensor = new Gpio(options.pins.sensor, 'in', 'both');
    this._statusOpen = new Gpio(options.pins.statusOpen, 'out');
    this._statusClosed = new Gpio(options.pins.statusClosed, 'out');
    this._doorSwitch = new Gpio(options.pins.doorSwitch, 'out');

    this._sensor.read(this.handleSensor.bind(this));
    this._sensor.watch(this.handleSensor.bind(this));
  }

  status() {
    return this.isOpen ? 'open' : 'closed';
  }

  toggle() {
    console.log('Door toggled')
    this._doorSwitch.writeSync(1)
    setTimeout(() => { this._doorSwitch.writeSync(0); }, 100);
  }

  open() {
    if (!this.isOpen) this.toggle();
  }

  close() {
    if (this.isOpen) this.toggle();
  }

  handleSensor(err, value) {
    if (err) throw err;
    const boolValue = !!value;
    if (this.isOpen !== boolValue) {
      this._statusOpen.writeSync(value^1);
      this._statusClosed.writeSync(value);
      this.isOpen = boolValue;
      this.emit('status', this.status(), this.isOpen);
    }
  }
}
