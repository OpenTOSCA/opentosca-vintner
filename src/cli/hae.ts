export default (action: (options: any) => Promise<void>): ((options: any) => Promise<void>) => {
    return async (options: any) => {
        try {
            await action(options)
        } catch (e) {
            console.log(e)
            process.exit(1)
        }
    }
}
