import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';

import log from './lib/log';
import router from './routes';
import './db';

const app = express();
const port = 4990 || process.env.PORT;

app.use(bodyParser.json());
app.use(cors({
  allowedHeaders: 'Content-Type',
  methods: ['GET, POST, PUT, DELETE, OPTIONS'],
}));

app.use(express.static(path.join(__dirname, '../../client/build')));

app.use('/api', router);

app.listen(port, () => log(`rest-server listening on port ${port}`));

