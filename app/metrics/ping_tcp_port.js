import fs from 'node:fs/promises';

import env from '../../env.js';
import {getCurrentFilename} from '../helpers/paths.js';
import {ping} from '../helpers/pinger.js';

export default {
    name: getCurrentFilename(import.meta.url),
    help: 'Pinger',
    labelNames: [
        'host',
        'ip',
        'port',
        'online',
    ],

    async collect(ctx) {
        ctx.reset();

        const targets = await fs.readFile(env.ping.targetsFile);
        const data = await Promise.all(JSON.parse(targets).map(target => ping(target)));

        data.forEach(elem => {
            ctx.labels(
                elem.host || null,
                elem.ip || null,
                elem.port,
                elem.online,
            ).set(elem.onlineChanged);
        });
    },
};
