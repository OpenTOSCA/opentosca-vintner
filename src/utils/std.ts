import * as console from 'console'

export default {
    out: console.log,
    log: (...data: any[]) => {
        console.error(...data)
    },
    table: (data: any) => {
        console.table(data)
    },
}
