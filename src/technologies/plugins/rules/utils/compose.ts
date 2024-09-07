export type DockerCompose = {
    name?: string
    services: {
        [key: string]: {
            container_name: string
            image: string
            network_mode: string
            command?: string[]
            environment?: {[key: string]: string}
        }
    }
}
