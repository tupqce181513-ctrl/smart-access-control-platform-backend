const mqttConfig = {
  brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost',
  port: parseInt(process.env.MQTT_PORT) || 1883,
  options: {
    clientId: process.env.MQTT_CLIENT_ID || `smart-access-control-${Date.now()}`,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 5000,
    keepalive: 60,
    clean: true,
    // TLS options – required for HiveMQ Cloud (port 8883)
    ...(parseInt(process.env.MQTT_PORT) === 8883 && {
      rejectUnauthorized: false, // Accept HiveMQ Cloud's self-signed/CA cert
    }),
  },
};

module.exports = mqttConfig;
