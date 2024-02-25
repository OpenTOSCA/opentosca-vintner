#!/usr/bin/env bash
set -e

APPLICATION_NAME="$1"
APPLICATION_ARTIFACT="$2"
APPLICATION_DIRECTORY=/var/lib/node-applications/${APPLICATION_NAME}
APPLICATION_PORT="80"
APPLICATION_INTERFACE="0.0.0.0"

DB_DIALECT="$3"
DB_NAME="$4"
DB_USERNAME="$5"
DB_PASSWORD="$6"
DB_ADDRESS="$7"


# Install Node.js
if [ ! -f /usr/bin/node ]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
    sudo apt-get install -y nodejs
fi

# Create applications directory
mkdir -p /usr/lib/node-applications

# Create application directory
mkdir -p ${APPLICATION_DIRECTORY}

# Extract deployment artifact in application directory
tar -xzf ${APPLICATION_ARTIFACT} -C ${APPLICATION_DIRECTORY}

# Install dependencies
cd ${APPLICATION_DIRECTORY}
/usr/bin/npm ci

# Create .env file
cat <<EOF >> ${APPLICATION_DIRECTORY}/.env
PORT=${APPLICATION_PORT}
INTERFACE="${APPLICATION_INTERFACE}"
DB_DIALECT=${DB_DIALECT}
DB_NAME=${DB_NAME}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_ADDRESS=${DB_ADDRESS}
EOF

# Create service
cat <<EOF >> /etc/systemd/system/${APPLICATION_NAME}.service
[Unit]
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/npm start
WorkingDirectory=${APPLICATION_DIRECTORY}
EnvironmentFile=${APPLICATION_DIRECTORY}/.env

[Install]
WantedBy=multi-user.target
EOF

# Start service
systemctl daemon-reload
systemctl start ${APPLICATION_NAME}
systemctl enable ${APPLICATION_NAME}
