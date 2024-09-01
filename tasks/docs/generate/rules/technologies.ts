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
        'Ansible is an open-source automation tool primarily used for configuration management, application deployment, and task automation. It allows IT administrators and DevOps teams to manage software on servers using SSH, without the need for agents on target nodes. Ansible uses simple, human-readable YAML files called playbooks to define tasks and configurations, enabling consistent management of IT environments across multiple servers. Its main purpose is to simplify the management of software configurations, reduce manual effort, and ensure consistency and reliability in IT operations, making it an ideal tool for automating repetitive tasks and orchestrating complex workflows across diverse environments.',
    link: 'https://ansible.com',
}

const terraform: TechnologyDescription = {
    id: 'terraform',
    name: 'Terraform',
    description:
        'Terraform is an open-source infrastructure as code (IaC) tool developed by HashiCorp that allows users to define, provision, and manage cloud infrastructure in a consistent, automated, and reproducible way. Using a declarative configuration language called HashiCorp Configuration Language (HCL) or JSON, Terraform enables users to define infrastructure components such as virtual machines, networks, and storage in human-readable configuration files. It supports a wide range of cloud providers, including AWS, Azure, Google Cloud, and many others, allowing for seamless multi-cloud management. By applying these configurations, Terraform creates and manages the defined resources through APIs, making it a powerful tool for automating infrastructure deployment, scaling, and version control. However, Terraform is specifically designed for managing infrastructure and is not intended for managing software on remote targets, which is outside its primary scope.',
    link: 'https://terraform.io',
}

const kubernetes: TechnologyDescription = {
    id: 'kubernetes',
    name: 'Kubernetes',
    description:
        'Kubernetes, also known as K8s, is an open-source system for automating the deployment, scaling, and management of containerized applications, offering production-grade container orchestration. It provides a robust platform for running and managing applications in clusters of servers, ensuring high availability, scalability, and efficient resource utilization. Kubernetes allows users to define the desired state of their applications using declarative manifests, which specify the configuration, deployment, and management of containerized workloads. By continuously monitoring and adjusting the cluster to match these desired states, Kubernetes simplifies the application deployment process, supports automated rollouts and rollbacks, and ensures the self-healing of applications, making it a critical tool for modern software delivery and operational efficiency.',
    link: 'https://kubernetes.io',
}

const compose: TechnologyDescription = {
    id: 'compose',
    name: 'Docker Compose',
    description:
        'Docker Compose is a tool that enables the definition and running of multi-container applications on a Docker Engine, using a single YAML configuration file. It streamlines the management of complex applications by simplifying the control of services, networks, and volumes, allowing developers to manage the entire stack effortlessly. Compose is particularly suited for development, testing, and single-host deployments, providing a consistent environment across various stages of the application lifecycle. However, it is limited to working within the Docker ecosystem, as it only deploys on Docker Engine, making it an ideal choice for those heavily invested in Docker-based workflows.',
    link: 'https://docs.docker.com/compose',
}

const descriptions: TechnologyDescription[] = [ansible, terraform, kubernetes, compose]

export default descriptions
