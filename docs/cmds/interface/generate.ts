import * as path from 'path'
import {renderFile} from '../utils'
import {program} from '../../../src/cli/program'
import {Command, Option} from 'commander'
import * as utils from '#utils'
import * as validator from '#validator'

type CommandInformation = {
    commands: string[]
    usage: string
    description: string
    options: OptionInformation[]
    cli: boolean
    server: boolean
}
type OptionInformation = {option: string; type: string; description: string; mandatory: boolean}

async function main() {
    const data: CommandInformation[] = []
    run(program, [])

    data.push({
        commands: ['instances', 'adapt'],
        usage: 'vintner instances adapt',
        description: 'submit sensor data used for adapting the instance',
        options: [
            {
                option: 'instance',
                type: 'string',
                description: 'instance name',
                mandatory: true,
            },
            {option: 'inputs', type: 'InputAssignmentMap', description: 'sensor data', mandatory: true},
        ],
        cli: false,
        server: true,
    })
    data.push({
        commands: ['instances', 'unadapt'],
        usage: 'vintner instances unadapt',
        description: 'stop adaptation loop of instance',
        options: [
            {
                option: 'instance',
                type: 'string',
                description: 'instance name',
                mandatory: true,
            },
        ],
        cli: false,
        server: true,
    })

    data.sort((a, b) => a.usage.localeCompare(b.usage))

    await renderFile(path.join(__dirname, 'template.ejs'), {data}, path.join('docs', 'docs', 'interface.md'))

    function run(command: Command, commands: string[]) {
        if (command.name() !== 'vintner') commands.push(command.name())

        const options = (command as any).options.map((option: Option) => {
            let description = option.description

            const defaultDescription = validator.isDefined(option.defaultValue)
                ? `default: ${JSON.stringify(option.defaultValue)}`
                : undefined

            const choicesDescription = validator.isDefined(option.argChoices)
                ? `choices: ${JSON.stringify(option.argChoices)}`
                : undefined

            const additionalDescription = utils.joinNotNull([choicesDescription, defaultDescription], ', ')
            if (additionalDescription !== '') description += ' (' + additionalDescription + ')'

            return {
                option: option.long?.slice(2),
                type: option.flags?.split(' ')[1]?.slice(1, -1),
                description,
                mandatory: option.required || option.mandatory || false,
            }
        })

        if (utils.isEmpty(command.commands))
            data.push({
                commands,
                usage: 'vintner ' + commands.join(' '),
                description: command.description(),
                options,
                cli: true,
                server: !isCLIOnly(commands),
            })
        command.commands.forEach(it => run(it, [...commands]))
    }
}

function isCLIOnly(commands: string[]) {
    return ['server', 'sensors'].includes(commands[0]) || ['open', 'path', 'code'].includes(commands[1])
}

main()
