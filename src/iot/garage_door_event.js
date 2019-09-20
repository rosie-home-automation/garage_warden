import { Event } from 'webthing';

export default class GarageDoorEvent extends Event {
  static get KEY() {
    return 'garage_door_event';
  }

  constructor(thing, data) {
    super(thing, GarageDoorEvent.KEY, data);
  }
}
