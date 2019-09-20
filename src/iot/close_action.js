import { Action } from 'webthing';
import uuidv4 from 'uuid/v4';

import BusKeeper from '../bus_keeper';

export default class CloseAction extends Action {
  static get KEY() {
    return 'close';
  }
  constructor(thing, input) {
    super(uuidv4(), thing, CloseAction.KEY, input);
  }

  performAction() {
    return new Promise((resolve) => {
      BusKeeper.garageDoor.emit('action', 'close');
      resolve();
    });
  }
}
