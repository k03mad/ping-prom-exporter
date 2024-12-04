# [TCP Ping Port — Prometheus] exporter

— Create `targets.json`

```bash
cp targets-template.json targets.json
```

— [Use correct Node.JS version](.nvmrc) \
— Start exporter:

```bash
# one time
npm run setup

# start
npm run start --port=11000
# or with envs
PING_EXPORTER_PORT=11000 npm run start
```

[grafana-dashboards](https://github.com/k03mad/grafana-dashboards/tree/master/export)
