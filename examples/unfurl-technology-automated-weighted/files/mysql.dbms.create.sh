#!/usr/bin/env bash
set -e
export DEBIAN_FRONTEND="noninteractive"

DBMS_ROOT_PASSWORD=$1

# Set password
debconf-set-selections <<< "mysql-server mysql-server/root_password password ${DBMS_ROOT_PASSWORD}"
debconf-set-selections <<< "mysql-server mysql-server/root_password_again password ${DBMS_ROOT_PASSWORD}"

# Install mysql
apt-get update -y
apt-get -y install mysql-server-5.8

# Password-less auth
cat <<EOF > /root/.my.cnf
[client]
user=root
password=${DBMS_ROOT_PASSWORD}
EOF

# Listen on all interfaces
sed -i 's/127\.0\.0\.1/0\.0\.0\.0/g' /etc/mysql/mysql.conf.d/mysqld.cnf

# Configure any hots for root
mysql -u root -e 'USE mysql; UPDATE `user` SET `Host`="%" WHERE `User`="root"; FLUSH PRIVILEGES;'

# Enable service
systemctl enable mysql

# Restart service
systemctl restart mysql