import { EventEmitter } from 'events';

const buses = {
  authorizer: null,
  garageDoor: null,
  rfidReader: null,
};

export default class BusKeeper {
  static init() {
    buses.authorizer = new EventEmitter();
    buses.garageDoor = new EventEmitter();
    buses.rfidReader = new EventEmitter();
  }

  static get authorizer() {
    return buses.authorizer;
  }

  static get garageDoor() {
    return buses.garageDoor;
  }

  static get rfidReader() {
    return buses.rfidReader;
  }
}
