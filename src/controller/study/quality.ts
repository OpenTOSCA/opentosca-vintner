import * as assert from '#assert'
import * as check from '#check'
import Controller from '#controller'
import {TemplateQualityOutput} from '#controller/template/quality'
import * as files from '#files'
import std from '#std'
import * as utils from '#utils'
import path from 'path'

export type StudyQualityOptions = {
    config?: string
    experimental: boolean
}

export type Config = {
    study: 'quality'
    dir: string
    groups: {id: string; application: string; variants: string[]}[]
}

type Answer = {
    group: string
    intuitive_complexity_scale: string
    intuitive_complexity_comment: string
    intuitive_confidence_scale: string
    intuitive_confidence_comment: string
    supported_complexity_scale: string
    supported_complexity_comment: string
    supported_confidence_scale: string
    supported_confidence_comment: string
    demographics_variability: string
    demographics_job: string
    demographics_degree: string
    demographics_experience_cs: string
    demographics_experience_iac: string
    demographics_experience_TOSCA: string
    demographics_permission_studies: string
    id: string
    label: string
}

type ExtendedAnswer = {dir: string} & Answer

type Store = {
    [application: string]: {[variant: string]: {quality: TemplateQualityOutput; submission: ExtendedAnswer}[]}
}

export default async function (options: StudyQualityOptions) {
    options.config = options.config ?? 'study.quality.yaml'
    assert.isTrue(options.experimental)

    /**
     * Config
     */
    const config = files.loadYAML<Config>(options.config)
    if (config.study !== 'quality') throw new Error(`Study "${config.study}" must be "quality"`)

    /**
     * Collect all submissions
     */
    const submissions = files
        .listDirectories(config.dir)
        .map(dir => ({dir, ...files.loadYAML<Answer>(path.join(config.dir, dir, 'questionnaire.yaml'))}))
        .filter(it => it.label === 'INCLUDED')

    /**
     * Median experience
     */
    const median = utils.median(submissions.map(it => Number(it.demographics_experience_iac)))
    std.log('median', median)

    /**
     * Collect all qualities
     */
    const store: Store = {}
    for (const submission of submissions) {
        const group = config.groups.find(it => it.id === submission.group)
        assert.isDefined(group)

        for (const variant of group.variants) {
            std.log(submission.dir, variant)
            const template = path.join(config.dir, submission.dir, variant + '.yaml')
            const quality = await Controller.template.quality({template, punish: false})
            std.log(submission.demographics_experience_iac, quality)

            if (check.isUndefined(store[group.id])) store[group.id] = {}
            if (check.isUndefined(store[group.id][variant])) store[group.id][variant] = []
            store[group.id][variant].push({quality, submission})
        }
    }

    /**
     * Plot each variant
     */
    for (const group of config.groups) {
        for (const variant of group.variants) {
            std.log(plot(group.application, variant, store[group.id][variant], median))
        }
    }

    /**
     * Plot all variants
     */
    std.log(
        plot(
            'all',
            'all',
            Object.values(store).flatMap(group => Object.values(group).flat()),
            median
        )
    )
}

function plot(
    application: string,
    variant: string,
    qualities: {quality: TemplateQualityOutput; submission: Answer}[],
    median: number
) {
    return `
\\begin{figure}[t]
  \\centering
  
\\begin{tikzpicture}[entry/.style={text=black, rectangle, draw, inner sep=3pt, text width=15pt, align=center, minimum height=13pt}]
\\begin{axis}[
    ybar stacked,
    bar width=30pt,
    enlargelimits=0.2,
    symbolic x coords={Very Low,Low,Medium,High,Very High},
    xticklabel style={rotate=45, anchor=east},
    xtick={Very Low,Low,Medium,High,Very High},
    ymin=0,
    ymax=7,
    xmin={Very Low},
    xmax={Very High},
    width=0.5\\textwidth,
]

${Object.entries(utils.groupBy(qualities, it => it.quality.quality))
    .map(([_, data]) => {
        return data
            .sort(
                (a, b) =>
                    Number(b.submission.demographics_experience_iac) - Number(a.submission.demographics_experience_iac)
            )
            .map((it, index) => {
                const exp = Number(it.submission.demographics_experience_iac)
                const fill = exp < median ? 'white' : exp === median ? 'black!10' : 'black!30'

                const broken = it.quality.assigned !== it.quality.total

                return `
\\node[entry, fill=${fill}] at (axis cs:${toDataLabel(it.quality.quality)}, ${0.5 + index}) {\\scriptsize ${
                    broken ? '$\\times$' : ''
                }};
`
            })
            .join('')
    })
    .join('')}
    
\\end{axis}
\\end{tikzpicture}

\\caption{${application} ${variant}}
  \\label{fig:${application}_${variant}}
\\end{figure}
`
}

function toDataLabel(str: string) {
    return str
        .replace(/_/g, ' ')
        .replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())
}
