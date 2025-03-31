import dockerEngine from './docker-engine'
import gcpService from './gcp-service'
import ingress from './ingress'
import mysqlDatabase from './mysql-database'
import mysqlDBMS from './mysql-dbms'
import objectStorage from './object-storage'
import redisServer from './redis-server'
import serviceComponent from './service-component'
import softwareComponent from './software-component'
import virtualMachine from './virtual-machine'

export default [
    objectStorage,
    dockerEngine,
    gcpService,
    ingress,
    mysqlDatabase,
    mysqlDBMS,
    redisServer,
    serviceComponent,
    softwareComponent,
    virtualMachine,
]
