const mongoose = require('mongoose');
const env = process.env;

mongoose.debug= true;

const mongoConnectionUrl = `mongodb://${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

mongoose.connect(mongoConnectionUrl);

module.exports = mongoose;
