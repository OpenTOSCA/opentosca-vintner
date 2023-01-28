import * as path from 'path'
import {renderFile} from '../utils'
import {program} from '../../../src/cli/program'
import {Command, Option} from 'commander'
import * as utils from '#utils'
import * as validator from '#validator'

async function main() {
    const data: any[] = []
    run(program, [])
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
                mandatory: option.required || option.mandatory,
            }
        })

        if (utils.isEmpty(command.commands))
            data.push({
                commands,
                usage: commands.join(' '),
                description: command.description(),
                options,
                cliOnly: isCLIOnly(commands),
            })
        command.commands.forEach(it => run(it, [...commands]))
    }
}

function isCLIOnly(commands: string[]) {
    return commands[0] === 'server' || commands[1] === 'open'
}

main()
