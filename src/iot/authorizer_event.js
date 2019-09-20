import { Event } from 'webthing';

export default class AuthorizerEvent extends Event {
  static get KEY() {
    return 'authorizer_event';
  }

  constructor(thing, data) {
    super(thing, AuthorizerEvent.KEY, data);
  }
}
