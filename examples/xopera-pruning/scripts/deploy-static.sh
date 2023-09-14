yarn cli templates import --template static-pruning --path examples/xopera-pruning
yarn cli instances init --instance static-pruning --template static-pruning
yarn cli instances resolve --instance static-pruning --presets static
yarn cli instances deploy --instance static-pruning --inputs examples/xopera-pruning/deployment-inputs.ignored.yaml