import os from 'node:os';

import client from 'prom-client';

import env from '../env.js';

import {logError} from './helpers/logging.js';
import {packageJson} from './helpers/parse.js';
import * as metrics from './metrics/_index.js';

const register = new client.Registry();

client.collectDefaultMetrics({register});

register.setDefaultLabels({
    app: packageJson.name,
    host: os.hostname,
    port: env.server.port,
});

Object
    .values(metrics)
    .forEach(metric => {
        const {collect, name, ...rest} = metric;

        const gauge = new client.Gauge({
            name,
            ...rest,
            async collect() {
                try {
                    await collect(this);
                } catch (err) {
                    logError([`[${name}]`, err]);
                }
            },
        });

        register.registerMetric(gauge);
    });

export default register;
