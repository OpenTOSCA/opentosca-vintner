#!/usr/bin/env bash
set -e
export DEBIAN_FRONTEND="noninteractive"

DBMS_ROOT_PASSWORD=$1

sudo debconf-set-selections <<< "mysql-server mysql-server/root_password password ${DBMS_ROOT_PASSWORD}"
sudo debconf-set-selections <<< "mysql-server mysql-server/root_password_again password ${DBMS_ROOT_PASSWORD}"

# Install mysql
apt-get update -y
apt-get -y install mysql-server-5.7

# mysql_secure_installation

# All interfaces
sed -i 's/127\.0\.0\.1/0\.0\.0\.0/g' /etc/mysql/my.cnf
mysql -uroot -p -e 'USE mysql; UPDATE `user` SET `Host`="%" WHERE `User`="root" AND `Host`="localhost"; DELETE FROM `user` WHERE `Host` != "%" AND `User`="root"; FLUSH PRIVILEGES;'

# Systemd
systemctl enable mysql
systemctl restart mysql