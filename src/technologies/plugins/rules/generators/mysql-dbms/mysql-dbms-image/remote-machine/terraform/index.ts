import {ImplementationGenerator} from '#technologies/plugins/rules/types'
import {AnsibleHostEndpointCapability} from '#technologies/plugins/rules/utils/ansible'
import {TerraformSSHConnection, TerraformStandardOperations} from '#technologies/plugins/rules/utils/terraform'
import {
    BASH_HEADER,
    MetadataGenerated,
    MetadataUnfurl,
    OpenstackMachineCredentials,
    OpenstackMachineHost,
} from '#technologies/plugins/rules/utils/utils'

const script = `
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

// TODO: ensure dbms_version is installed

const generator: ImplementationGenerator = {
    component: 'mysql.dbms',
    technology: 'terraform',
    artifact: 'dbms.image',
    hosting: ['remote.machine'],
    weight: 0,
    reason: 'Ansible is more specialized. Also using provisioners is a "last resort".',
    details:
        '"terraform_data" resource with an "ssh" connection to the virtual machine to copy the install script using the "file" provisioner on the virtual machine and to execute the script using the "remote-exec" provisioner',

    generate: (name, type) => {
        return {
            derived_from: name,
            metadata: {
                ...MetadataGenerated(),
                ...MetadataUnfurl(),
            },
            properties: {
                ...OpenstackMachineCredentials(),
                ...OpenstackMachineHost(),
                application_port: {
                    type: 'string',
                    default: 3001,
                },
                application_address: {
                    type: 'string',
                    default: '127.0.0.1',
                },
            },
            attributes: {
                management_address: {
                    type: 'string',
                    default: {
                        eval: '.::.requirements::[.name=host]::.target::management_address',
                    },
                },
                management_port: {
                    type: 'integer',
                    default: {eval: '.::application_port'},
                },
            },
            capabilities: {
                ...AnsibleHostEndpointCapability(),
            },
            interfaces: {
                ...TerraformStandardOperations(),
                defaults: {
                    inputs: {
                        main: {
                            resource: {
                                terraform_data: {
                                    vm: [
                                        {
                                            connection: [
                                                {
                                                    ...TerraformSSHConnection(),
                                                },
                                            ],
                                            provisioner: {
                                                file: [
                                                    {
                                                        content: script,
                                                        destination: '/tmp/install-mysql-dbms.sh',
                                                    },
                                                ],
                                                'remote-exec': [
                                                    {
                                                        inline: [
                                                            'sudo bash /tmp/install-mysql-dbms.sh {{ SELF.dbms_password }} {{ SELF.application_port }}',
                                                        ],
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
        }
    },
}

export default generator
