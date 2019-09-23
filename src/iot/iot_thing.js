import {
  Property,
  SingleThing,
  Thing,
  Value,
  WebThingServer,
} from 'webthing';

import CloseAction from './close_action';
import OpenAction from './open_action';
import AuthorizerEvent from './authorizer_event';
import GarageDoorEvent from './garage_door_event';

import BusKeeper from '../bus_keeper';

const makeThing = () => {
  const thing = new Thing(
    'urn:dev:ops:garage-warden-01',
    'Garage Warden',
    ['DoorSensor'],
    'Rfid reader and garage door'
  );

  thing.addProperty(
    new Property(thing,
      'open',
      new Value(),
      {
        '@type': 'OpenProperty',
        title: 'Open',
        type: 'boolean',
        description: 'Whether the garage door is open',
      }
    )
  );

  thing.addAvailableAction(
    CloseAction.KEY,
    {
      title: 'Close',
      description: 'Close the garage door',
    },
    CloseAction
  );

  thing.addAvailableAction(
    OpenAction.KEY,
    {
      title: 'Open',
      description: 'Open the garage door',
    },
    OpenAction
  );

  thing.addAvailableEvent(
    GarageDoorEvent.KEY,
    {
      description: 'The garage door opened or closed',
      type: 'string',
    }
  );

  thing.addAvailableEvent(
    AuthorizerEvent.KEY,
    {
      description: 'A user was authorized or unauthorized',
      type: 'string',
    }
  );

  return thing;
};

export default class IotThing {
  constructor() {
    this._thing = makeThing();
    this._server = new WebThingServer(new SingleThing(this.thing), 8888);
  }

  get server() {
    return this._server;
  }

  get thing() {
    return this._thing;
  }

  async start() {
    BusKeeper.garageDoor.on('status', (status, isOpen) => {
      this._thing.setProperty('open', isOpen);
      this._thing.addEvent(new GarageDoorEvent(this._thing, `Garage door ${status}`));
    });
    BusKeeper.authorizer.on('authorized', (credential) => {
      this._thing.addEvent(new AuthorizerEvent(this._thing, `Authorized ${credential.name}`));
    });
    BusKeeper.authorizer.on('unauthorized', (type, value) => {
      this._thing.addEvent(new AuthorizerEvent(this._thing, `Unauthorized ${type} ${value}`));
    });
    await this.server.start();
  }

  async stop() {
    await this.server.stop();
  }
}
