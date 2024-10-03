const env = {
    server: {
        port: process.env.npm_config_port
            || process.env.PING_EXPORTER_PORT
            || 11_008,
    },
    debug: process.env.DEBUG,
    ping: {
        concurrency: 2,
        lastStateFolder: '.pinger',
        targetsFile: 'targets.json',
    },
};

export default env;
