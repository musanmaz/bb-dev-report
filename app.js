const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const staticMiddleware = require('serve-static');

const app = express();
const port = process.env.PORT || 3000;

const addon = require('atlassian-connect-express')(app);
const routes = require('./routes');

// View engine ayarları (Handlebars)
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

// Middleware'ler
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({ secret: 'bitbucket-dev-report-secret', resave: true, saveUninitialized: true }));

// Atlassian Connect middleware
app.use(addon.middleware());

// Public dizin (JS, CSS, görsel)
app.use(staticMiddleware(path.join(__dirname, 'public')));

// Descriptor JSON dosyasını sunmak için route
app.get('/atlassian-connect.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'atlassian-connect.json'));
});

// Ana uygulama route'ları
routes(app, addon);

// Uygulama başlatılıyor
app.listen(port, () => {
  console.log(`Add-on running at http://localhost:${port}`);
});
