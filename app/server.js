import {getDateYMDHMS} from '@k03mad/simple-date';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import env from '../env.js';

import {nameText, numText} from './helpers/colors.js';
import {log} from './helpers/logging.js';
import {packageJson} from './helpers/parse.js';
import register from './prom.js';

const app = express();

if (env.debug) {
    app.use(morgan('combined'));
}

app.use(helmet());
app.use(compression());

app.get('/metrics', async (req, res) => {
    const metrics = await register.metrics();
    res.send(metrics);
});

app.listen(env.server.port, () => log([
    `[${getDateYMDHMS()}]`,
    nameText(packageJson.name),
    'started on port',
    numText(env.server.port),
].join(' ')));
