const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const routes = require('./routes');
const {injectModel} = require('./modules/utils');
const port = process.env.NODE_LOCAL_PORT || 4000;
const connect = require('./config/connect');

//For BodyParser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(injectModel);
app.use(cors());
// For Passport
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
})); // session secret

app.use('/api', routes);

LOCATEMEAPP = {};
// DB Connection
connect().then(() => {
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    app.emit('app_started');
  });
});

module.exports = app;