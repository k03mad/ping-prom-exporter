import fs from 'node:fs/promises';
import path from 'node:path';

import CacheableLookup from 'cacheable-lookup';
import isPortReachable from 'is-port-reachable';

import env from '../../env.js';

import {sleep} from './promise.js';

const cacheable = new CacheableLookup();

/**
 * @param {object} opts
 * @param {string} opts.host
 * @param {string} opts.ip
 * @param {string} [opts.port]
 * @param {number} [opts.retry] ms
 * @param {number} [opts.timeout] ms
 */
export const ping = async ({
    host,
    ip,
    port = 80,
    timeout = 1000,
    retry = 1000,
} = {}) => {
    const lastStateFile = path.join(
        env.ping.lastStateFolder,
        `${host || ip}_${port}.json`,
    );

    if (host) {
        try {
            const lookup = await cacheable.lookupAsync(host);
            ip = lookup.address;
        } catch (err) {
            if (err.code !== 'ENOTFOUND') {
                throw err;
            }
        }
    }

    const checkOpts = [port, {host: ip || host, timeout}];
    let online = await isPortReachable(...checkOpts);

    // one retry
    if (!online) {
        await sleep(retry);
        online = await isPortReachable(...checkOpts);
    }

    const output = {host, ip, port, online};

    let previousCheck;

    try {
        const savedData = await fs.readFile(lastStateFile);
        previousCheck = JSON.parse(savedData);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }

    if (previousCheck) {
        output.onlineChanged = previousCheck.onlineChanged;
    }

    if (previousCheck?.online !== online) {
        output.onlineChanged = Date.now();
        await fs.mkdir(path.dirname(lastStateFile), {recursive: true});
        await fs.writeFile(lastStateFile, JSON.stringify(output));
    }

    return output;
};
