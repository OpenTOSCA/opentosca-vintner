import * as assert from '#assert'
import Controller from '#controller'
import {TemplateQualityOutput} from '#controller/template/quality'
import * as files from '#files'
import * as utils from '#utils'
import path from 'path'

export type StudyQualityOptions = {
    dir?: string
    experimental: boolean
}

export default async function (options: StudyQualityOptions) {
    options.dir = options.dir ?? '/usefulness/edited'
    assert.isTrue(options.experimental)

    // TODO: hardcoded
    const qualities: {[key: string]: {[key: string]: {quality: TemplateQualityOutput; submission: Answer}[]}} = {
        A: {
            development: [],
            hyperscaler: [],
            customer: [],
        },
        B: {
            vm: [],
            gcp: [],
            kubernetes: [],
        },
    }

    /**
     * Collect all submissions
     */
    const submissions = files
        .listDirectories(options.dir)
        .map(dir => ({dir, ...files.loadYAML<Answer>(path.join(options.dir!, dir, 'questionnaire.yaml'))}))
        .filter(it => it.label === 'INCLUDED')

    /**
     * Median experience
     */
    const median = utils.median(submissions.map(it => Number(it.demographics_experience_iac)))
    console.log('median', median)

    /**
     * Collect all qualities
     */
    for (const submission of submissions) {
        for (const variant of Object.keys(qualities[submission.group])) {
            console.log(submission.dir, variant)
            const template = path.join(options.dir, submission.dir, variant + '.yaml')
            const quality = await Controller.template.quality({template, punish: false})
            console.log(submission.demographics_experience_iac, quality)
            qualities[submission.group][variant].push({quality, submission})
        }
    }

    /**
     * Plot each variant
     */
    for (const application of Object.keys(qualities)) {
        for (const variant of Object.keys(qualities[application])) {
            console.log(plot(application, variant, qualities[application][variant], median))
        }
    }

    console.log(
        plot(
            'all',
            'all',
            Object.values(qualities).flatMap(group => Object.values(group).flat()),
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
