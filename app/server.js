import {startMetricsServer} from '@k03mad/simple-prom';

import env from '../env.js';

import {packageJson} from './helpers/parse.js';
import * as metrics from './metrics/_index.js';

startMetricsServer({
    appName: packageJson.name,
    port: env.server.port,
    debug: env.debug,
    metrics,
});
