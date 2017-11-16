import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import https from 'https';

import log from './lib/log';
import router from './routes';
import './db';

const app = express();
const port = 443 || process.env.PORT;

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
  passphrase: 'codesling',
};

app.use(bodyParser.json());
app.use(cors({
  allowedHeaders: 'Content-Type,Authorization',
  methods: ['GET, POST, PUT, DELETE, OPTIONS'],
}));

app.use(express.static(path.join(__dirname, '../../client/build')));

app.use('/api', router);

// app.listen(port, () => log(`rest-server listening on port ${port}`));
https.createServer(sslOptions, app).listen(port, () => log(`rest-server listening on port ${port}`));

