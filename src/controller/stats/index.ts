import _ansible from './ansible'
import _description from './description'
import _edmm from './edmm'
import _ejs from './ejs'
import _pattern from './pattern'
import _pulumi from './pulumi'
import _terraform from './terraform'
import _tosca from './tosca'
import _toscafm from './tosca-fm'
import _vdmm from './vdmm'

export default {
    terraform: _terraform,
    ansible: _ansible,
    edmm: _edmm,
    vdmm: _vdmm,
    tosca: _tosca,
    pattern: _pattern,
    ejs: _ejs,
    pulumi: _pulumi,
    description: _description,
    toscafm: _toscafm,
}
