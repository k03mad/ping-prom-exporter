import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';

import {lookup} from 'dns-lookup-cache';
import isPortReachable from 'is-port-reachable';

import env from '../../env.js';

import {sleep} from './promise.js';

/**
 * @param {string} host
 * @param {4|6} family
 * @returns {Promise<string>}
 */
const ipLookup = (host, family) => new Promise((resolve, reject) => {
    lookup(host, {family}, (error, address) => {
        if (error) {
            reject(error);
        }

        resolve(address);
    });
});

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
            ip = await ipLookup(host, 4);
        } catch {
            try {
                ip = await ipLookup(host, 6);
            } catch {}
        }
    }

    const checkOpts = [port, {host: ip || host, timeout}];
    let isReachable = await isPortReachable(...checkOpts);

    // one retry
    if (!isReachable) {
        await sleep(retry);
        isReachable = await isPortReachable(...checkOpts);
    }

    try {
        const savedData = await fs.readFile(lastStateFile);
        previousCheck = JSON.parse(savedData);
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }

    const output = {
        host,
        ip: ip || null,
        port,
        ...isReachable
            ? {
                status: 'online',
                code: 1,
            }
            : {
                status: 'offline',
                code: 0,
            },
    };

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
