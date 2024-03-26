# Start server
node -r dotenv/config -r ts-node/register -r tsconfig-paths/register src/cli/index.ts server start
