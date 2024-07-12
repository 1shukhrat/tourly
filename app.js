require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('./db');
const router = require('./routes/mainRouter');


app.use(express.json({limit : '50mb'}));
app.use('/api', router);
app.use('/admin', express.static('public/admin.html'));
app.use('/content-manager', express.static('public/content-manager.html'));
app.use('/sales-manager', express.static('public/sales-manager.html'));
app.use('/tour', express.static('public/tour.html'));
app.use('/image', express.static(process.env.IMAGE_SOURCE_PATH));
app.use(express.static('public'));

mongoose.connection.on('open', () => {
    require('./models/models');
    app.listen(process.env.SERVER_PORT, () => {console.log(`Сервер запущен`);});
})



