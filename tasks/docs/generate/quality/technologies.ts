export type TechnologyDescription = {
    id: string
    name: string
    description: string
    link: string
}

const ansible: TechnologyDescription = {
    id: 'ansible',
    name: 'Ansible',
    description:
        'Ansible is an automation tool that can be used for configuration management, application deployment, and task automation. It allows system administrators and DevOps teams to manage software on servers using SSH, without the need for agents on target nodes. Further, Ansible is capable of managing infrastructure components, such as virtual machines, networks, and storage, and supports a wide range of cloud providers, such as AWS, Azure, Google Cloud and many others.',
    link: 'https://ansible.com',
}

const terraform: TechnologyDescription = {
    id: 'terraform',
    name: 'Terraform',
    description:
        'Terraform is an infrastructure as code (IaC) tool that allows users to define, provision, and manage cloud infrastructure. Using a declarative configuration language called HashiCorp Configuration Language (HCL), Terraform enables users to define infrastructure components such as virtual machines, networks, and storage in human-readable configuration files. It supports a wide range of cloud providers, including AWS, Azure, Google Cloud, and many others.',
    link: 'https://terraform.io',
}

const kubernetes: TechnologyDescription = {
    id: 'kubernetes',
    name: 'Kubernetes',
    description:
        'Kubernetes is a platform for automating the deployment, scaling, and management of containerized applications, such as Docker Containers. It provides capabilities for running and managing applications in clusters of servers, ensuring high availability, scalability, and efficient resource utilization. Kubernetes allows to define the desired state of their applications using declarative manifests, which specify the configuration, deployment, and management of containerized workloads.',
    link: 'https://kubernetes.io',
}

const compose: TechnologyDescription = {
    id: 'compose',
    name: 'Docker Compose',
    description:
        'Docker Compose is a tool that enables the definition and running of multi-container applications on a Docker Engine, using a single YAML configuration file. It allows the management of services, networks, and volumes, in a declarative manner.',
    link: 'https://docs.docker.com/compose',
}

export default [ansible, terraform, kubernetes, compose]
