import fs from 'node:fs/promises';

import pMap from 'p-map';

import env from '../../env.js';
import {getCurrentFilename} from '../helpers/paths.js';
import {ping} from '../helpers/pinger.js';

export default {
    name: getCurrentFilename(import.meta.url),
    help: 'Pinger',
    labelNames: [
        'type',
        'host',
        'ip',
        'port',
        'status',
    ],

    async collect(ctx) {
        ctx.reset();

        const targets = await fs.readFile(env.ping.targetsFile);

        const data = await pMap(
            JSON.parse(targets),
            target => ping(target),
            {concurrency: env.ping.concurrency},
        );

        data.forEach(elem => {
            ctx.labels(
                'table',
                elem.host,
                elem.ip,
                elem.port,
                elem.status,
            ).set(elem.changed);

            ctx.labels(
                'timeline',
                elem.host,
                null,
                elem.port,
                null,
            ).set(elem.code);
        });
    },
};
