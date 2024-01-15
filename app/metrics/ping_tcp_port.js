import fs from 'node:fs/promises';

import env from '../../env.js';
import {getCurrentFilename} from '../helpers/paths.js';
import {ping} from '../helpers/pinger.js';

export default {
    name: getCurrentFilename(import.meta.url),
    help: 'Pinger',
    labelNames: [
        'type',
        'host',
        'port',
        'status',
    ],

    async collect(ctx) {
        ctx.reset();

        const targets = await fs.readFile(env.ping.targetsFile);
        const data = await Promise.all(JSON.parse(targets).map(target => ping(target)));

        data.forEach(elem => {
            ctx.labels(
                'table',
                elem.host || elem.ip,
                elem.port,
                elem.status,
            ).set(elem.changed);

            ctx.labels(
                'timeline',
                elem.host || elem.ip,
                elem.port,
                null,
            ).set(elem.code);
        });
    },
};
