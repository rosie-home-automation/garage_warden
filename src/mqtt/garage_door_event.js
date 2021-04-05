import mqtt from 'mqtt';
import { mqtt as config } from 'config';

import BusKeeper from '../bus_keeper';
import logger from '../logger';

export default class GarageDoorEvent {
  constructor() {
    this.logger = logger.child({ module: 'GarageDoorEvent' });
    this.client = mqtt.connect(config.server);
    this.setupSubscriptions();
  }

  get connected() {
    return this.client.connected;
  }

  get configTopic() {
    return `${config.topicPrefix}/config`;
  }

  get controlTopic() {
    return `${config.topicPrefix}/control`;
  }

  get stateTopic() {
    return `${config.topicPrefix}/state`;
  }

  stop() {
    this.client.end();
  }

  reconnect() {
    this.client.reconnect()
  }

  setupSubscriptions() {
    BusKeeper.garageDoor.on('status', this.handleStatus.bind(this));
    this.client.subscribe(this.controlTopic)
    this.client.on('message', this.handleControlMessage.bind(this))
  }

  handleControlMessage(topic, message) {
    if (topic !== this.controlTopic) return

    this.logger.info('ACTION', { msg: message.toString() })
    BusKeeper.garageDoor.emit('action', message.toString())
  }

  handleStatus(status) {
    if (!this.connected) this.reconnect();
    // this.logger.info('WOOOO', { status, topic: this.topic });
    this.client.publish(this.stateTopic, JSON.stringify({ status }));
  }

  sendConfig() {
    if (!this.connected) this.reconnect();
    const payload = {
      name: 'Garage Door',
      state_topic: this.stateTopic,
      value_template: '{{ value_json.status }}'
    }
    this.client.publish(this.configTopic, JSON.stringify(payload));
  }
}
