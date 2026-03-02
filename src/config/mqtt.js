const mqttConfig = {
  brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost',
  port: process.env.MQTT_PORT || 1883,
  options: {
    clientId: process.env.MQTT_CLIENT_ID || 'smart-access-control-platform',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 5000,
    keepalive: 60,
    clean: true,
  },
};

module.exports = mqttConfig;
