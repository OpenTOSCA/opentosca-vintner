import * as console from 'console'
import {Table} from 'console-table-printer'

export default {
    out: console.log,
    log: (...data: any[]) => {
        console.error(...data)
    },
    table: (data: any) => {
        const table = new Table({defaultColumnOptions: {alignment: 'left'}})
        table.addRows(data, {color: 'green'})
        return table.render()
    },
}
