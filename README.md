• [ctrld-prom-exporter](https://github.com/k03mad/ctrld-prom-exporter) \
• [mik-prom-exporter](https://github.com/k03mad/mik-prom-exporter) \
• [mosobleirc-prom-exporter](https://github.com/k03mad/mosobleirc-prom-exporter) \
• ping-prom-exporter \
• [sys-prom-exporter](https://github.com/k03mad/sys-prom-exporter) \
• [tin-invest-prom-exporter](https://github.com/k03mad/tin-invest-prom-exporter) \
• [ya-iot-prom-exporter](https://github.com/k03mad/ya-iot-prom-exporter)

# [TCP Ping Port — Prometheus] exporter

— Create `targets.json`

```bash
cp targets-templates.json targets.json
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

— Update Prometheus `scrape_configs` \
— [Import Grafana dashboard](grafana)
