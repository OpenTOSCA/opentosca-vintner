import {execSync} from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as ejs from 'ejs'

async function main() {
    const data: any[] = []
    collectData([])

    const output = await ejs.renderFile(path.join(__dirname, 'template.ejs'), {data}, {async: true})
    fs.writeFileSync(path.join('docs', 'docs', 'interface.md'), output)

    function collectData(commands: string[]) {
        const command = `node build/cli/index.js ${commands.join(' ')} --help`
        const raw: string[] = execSync(command)
            .toString()
            .replace(/\(default:\n */gm, '(default: ')
            .split('\n')

        const usage = raw[0].slice(7).slice(0, -10)
        const description = raw[2]

        const optionsIndex = raw.findIndex(s => s === 'Options:')

        const commandsIndex = raw.findIndex(s => s === 'Commands:')

        const options =
            optionsIndex !== -1
                ? raw.slice(optionsIndex + 1, commandsIndex - 1).map(s => {
                      const data = s.trim().split(' ')
                      const optionIndex = data.findIndex(s => s.includes('--'))

                      const type = data[optionIndex + 1]
                      const typed = type.startsWith('<') || type.startsWith('[')

                      return {
                          short: data.find(s => s.includes('-')),
                          option: data[optionIndex].slice(2),
                          type: typed ? type.slice(1, -1) : undefined,
                          mandatory: typed ? type.startsWith('<') : false,
                          description: data.slice(data.lastIndexOf('') + 1).join(' '),
                      }
                  })
                : []

        const children =
            commandsIndex !== -1
                ? raw.slice(commandsIndex + 1, raw.length - 2).map(s => {
                      const data = s.trim().split(' ')
                      return {
                          command: data[0],
                          description: data.slice(data.lastIndexOf('') + 1).join(' '),
                      }
                  })
                : []

        if (!children.length) data.push({commands, usage, description, options, cliOnly: isCLIOnly(commands)})
        children.forEach(sc => collectData([...commands, sc.command]))
    }
}

function isCLIOnly(commands: string[]) {
    return commands[0] === 'server' || commands[1] === 'open'
}

main()
