import server from '#/server'

export type ServerStartOptions = {
    port: number
    host: string
}

export default async function ({port, host}: ServerStartOptions) {
    server.create().listen({port, host}, (): void => {
        console.log(`Server is now running on http://${host}:${port}`)
    })
}
