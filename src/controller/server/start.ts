import server from '#/server'
import std from '#std'

export type ServerStartOptions = {
    port: number
    host: string
}

export default async function ({port, host}: ServerStartOptions) {
    server.create().listen({port, host}, (): void => {
        std.log(`Server is now running on http://${host}:${port}`)
    })
}
