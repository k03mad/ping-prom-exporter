import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';

import CacheableLookup from 'cacheable-lookup';
import isPortReachable from 'is-port-reachable';

import env from '../../env.js';

import {sleep} from './promise.js';

const cacheable = new CacheableLookup();

/**
 * @param {object} opts
 * @param {string} opts.host
 * @param {string} [opts.port]
 * @param {number} [opts.retry] ms
 * @param {number} [opts.timeout] ms
 */
export const ping = async ({
    host,
    port = 80,
    timeout = 1000,
    retry = 1000,
} = {}) => {
    let ip, previousCheck;

    const lastStateFile = path.join(
        env.ping.lastStateFolder,
        `${host}_${port}.json`,
    );

    if (net.isIP(host) > 0) {
        ip = host;
    } else {
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
    let isReachable = await isPortReachable(...checkOpts);

    // one retry
    if (!isReachable) {
        await sleep(retry);
        isReachable = await isPortReachable(...checkOpts);
    }

    const output = {
        host,
        ip: ip || null,
        port,
        status: isReachable ? 'online' : 'offline',
        code: isReachable ? 1 : 0,
    };

    try {
        const savedData = await fs.readFile(lastStateFile);
        previousCheck = JSON.parse(savedData);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }

    if (previousCheck) {
        output.changed = previousCheck.changed;
    }

    if (previousCheck?.status !== output.status) {
        output.changed = Date.now();
        await fs.mkdir(path.dirname(lastStateFile), {recursive: true});
        await fs.writeFile(lastStateFile, JSON.stringify(output));
    }

    return output;
};
