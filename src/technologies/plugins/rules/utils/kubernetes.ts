// TODO: continue this

export type KubernetesDeploymentManifest = {
    apiVersion: 'apps/v1'
    kind: 'Deployment'
    metadata: {
        name: string
        namespace: string
    } & {[key: string]: string}
    spec: any
}
