import * as files from '#files'
import {BASH_HEADER} from '#technologies/plugins/rules/utils/utils'

// TODO: ensure dbms_version is installed

export const BashMySQLDBMSInstallationScript = `
${BASH_HEADER}
export DEBIAN_FRONTEND="noninteractive"

DBMS_PASSWORD=$1
DBMS_PORT=$2

# Set password
debconf-set-selections <<< "mysql-server mysql-server/root_password password $\{DBMS_PASSWORD}"
debconf-set-selections <<< "mysql-server mysql-server/root_password_again password $\{DBMS_PASSWORD}"

# Install mysql
apt-get update -y
apt-get -y install mysql-server

# Passwordless auth
cat <<EOF > /root/.my.cnf
[client]
user=root
password=$\{DBMS_PASSWORD}
EOF

# Listen on all interfaces
sed -i "s/127\\.0\\.0\\.1/0\\.0\\.0\\.0/g" /etc/mysql/mysql.conf.d/mysqld.cnf

# Listen on custom port
sed -i "s/# port.*/port = $\{DBMS_PORT}/g" /etc/mysql/mysql.conf.d/mysqld.cnf

# Configure any host for root
mysql -u root -e 'USE mysql; UPDATE user SET host = "%" WHERE user = "root"; FLUSH PRIVILEGES;'
mysql -u root -e 'USE mysql; DELETE FROM user WHERE user = "root" and host = "localhost"; FLUSH PRIVILEGES;'

# Enable service
systemctl enable mysql

# Restart service
systemctl restart mysql
`

export const BashMySQLDBMSInstallation =
    'sudo bash /tmp/install-mysql-dbms.sh {{ SELF.dbms_password }} {{ SELF.application_port }}'

export function AnsibleMySQLDBMSInstallation() {
    return [
        {
            name: 'installing mysql',
            'ansible.builtin.apt': {
                name: ['mysql-server', 'mysql-client', 'python3-mysqldb', 'libmysqlclient-dev'],
                state: 'present',
                update_cache: 'yes',
            },
        },
        {
            name: 'start and enable mysql service',
            'ansible.builtin.systemd': {
                name: 'mysql',
                state: 'started',
                enabled: 'yes',
            },
        },
        {
            name: 'enable passwordless login',
            'ansible.builtin.copy': {
                dest: '{{ item }}',
                content: files.toINI({
                    client: {
                        user: 'root',
                        password: '{{ SELF.dbms_password }}',
                    },
                }),
            },
            loop: ['/root/.my.cnf', '/home/{{ SELF.os_ssh_user }}/.my.cnf'],
        },
        {
            name: 'configure port (e.g., since 3306 is blocked by the provider)',
            'ansible.builtin.lineinfile': {
                path: '/etc/mysql/mysql.conf.d/mysqld.cnf',
                regexp: '^# port',
                line: 'port = {{ SELF.application_port }}',
                backup: 'yes',
            },
        },
        {
            name: 'enable remote login',
            'ansible.builtin.lineinfile': {
                path: '/etc/mysql/mysql.conf.d/mysqld.cnf',
                regexp: '^bind-address',
                line: 'bind-address = 0.0.0.0',
                backup: 'yes',
            },
        },
        {
            name: 'restart mysql',
            'ansible.builtin.systemd': {
                name: 'mysql',
                state: 'restarted',
            },
        },
        {
            name: 'create all root',
            'community.mysql.mysql_user': {
                name: 'root',
                password: '{{ SELF.dbms_password }}',
                priv: '*.*:ALL',
                host: '%',
                state: 'present',
                login_host: 'localhost',
                login_password: '{{ SELF.dbms_password }}',
                login_port: '{{ SELF.application_port }}',
                login_user: 'root',
            },
        },
        {
            name: 'delete localhost root',
            'community.mysql.mysql_user': {
                name: 'root',
                host: 'localhost',
                state: 'absent',
                login_host: 'localhost',
                login_password: '{{ SELF.dbms_password }}',
                login_port: '{{ SELF.application_port }}',
                login_user: 'root',
            },
        },
    ]
}

export function AnsibleMySQLDBMSUninstallation() {
    return [
        {
            name: 'uninstalling mysql',
            'ansible.builtin.apt': {
                name: ['mysql-server', 'mysql-client', 'python3-mysqldb', 'libmysqlclient-dev'],
                state: 'absent',
            },
        },
        {
            name: 'remove passwordless login',
            'ansible.builtin.file': {
                name: '{{ item }}',
                state: 'absent',
            },
            loop: ['/root/.my.cnf', '/home/{{ SELF.os_ssh_user }}/.my.cnf'],
        },
    ]
}
