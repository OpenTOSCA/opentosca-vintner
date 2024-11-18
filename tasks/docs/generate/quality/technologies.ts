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
        'Ansible is an automation tool primarily used for configuration management, application deployment, and task automation. It allows system administrators and DevOps teams to manage software on servers using SSH, without the need for agents on target nodes. Ansible uses simple, human-readable YAML files called playbooks to define tasks and configurations, enabling consistent management of IT environments across multiple servers.',
    link: 'https://ansible.com',
}

const terraform: TechnologyDescription = {
    id: 'terraform',
    name: 'Terraform',
    description:
        'Terraform is an infrastructure as code (IaC) tool that allows users to define, provision, and manage cloud infrastructure in a consistent, automated, and reproducible way. Using a declarative configuration language called HashiCorp Configuration Language (HCL), Terraform enables users to define infrastructure components such as virtual machines, networks, and storage in human-readable configuration files. It supports a wide range of cloud providers, including AWS, Azure, Google Cloud, and many others, allowing for seamless multi-cloud management. By applying these configurations, Terraform creates and manages the defined resources through APIs.',
    link: 'https://terraform.io',
}

const kubernetes: TechnologyDescription = {
    id: 'kubernetes',
    name: 'Kubernetes',
    description:
        'Kubernetes is a system for automating the deployment, scaling, and management of containerized applications, offering production-grade container orchestration. It provides a platform for running and managing applications in clusters of servers, ensuring high availability, scalability, and efficient resource utilization. Kubernetes allows users to define the desired state of their applications using declarative manifests, which specify the configuration, deployment, and management of containerized workloads. By continuously monitoring and adjusting the cluster to match these desired states, Kubernetes simplifies the application deployment process, supports automated rollouts and rollbacks, and ensures the self-healing of applications.',
    link: 'https://kubernetes.io',
}

const compose: TechnologyDescription = {
    id: 'compose',
    name: 'Docker Compose',
    description:
        'Docker Compose is a tool that enables the definition and running of multi-container applications on a Docker Engine, using a single YAML configuration file. It allows the management of services, networks, and volumes, in a declarative manner. Compose is particularly suited for single-host deployments, providing a consistent environment across various stages of the application lifecycle. However, it is limited to working within the Docker ecosystem.',
    link: 'https://docs.docker.com/compose',
}

export default [ansible, terraform, kubernetes, compose]
