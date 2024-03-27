# Serve server (hot-reload)
nodemon -r dotenv/config -r tsconfig-paths/register --ext "ts,json" src/cli/index.ts server start
