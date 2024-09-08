import dockerEngine from './docker-engine'
import gcpCloudSQL from './gcp-cloudsql'
import kubernetesCluster from './kubernetes-cluster'
import machine from './machine'

export default [dockerEngine, gcpCloudSQL, kubernetesCluster, machine]
