import dockerEngine from './docker-engine'
import gcpService from './gcp-service'
import ingress from './ingress'
import mysqlDatabase from './mysql-database'
import mysqlDBMS from './mysql-dbms'
import bucket from './object-storage'
import redisServer from './redis-server'
import serviceApplication from './service-application'
import softwareApplication from './software-application'
import virtualMachine from './virtual-machine'

export default [
    bucket,
    dockerEngine,
    gcpService,
    ingress,
    mysqlDatabase,
    mysqlDBMS,
    redisServer,
    serviceApplication,
    softwareApplication,
    virtualMachine,
]
