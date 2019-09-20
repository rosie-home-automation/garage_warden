import { Action } from 'webthing';
import uuidv4 from 'uuid/v4';

import BusKeeper from '../bus_keeper';

export default class OpenAction extends Action {
  static get KEY() {
    return 'open';
  }
  constructor(thing, input) {
    super(uuidv4(), thing, OpenAction.KEY, input);
  }

  performAction() {
    return new Promise((resolve) => {
      BusKeeper.garageDoor.emit('action', 'open');
      resolve();
    });
  }
}
