import os
from mkdocs_macros import fix_url

def define_env(env):

    @env.macro
    def linux_only_notice():
        return """!!! Warning
    This only works on Linux.
"""

    @env.macro
    def experimental_notice():
        return """!!! Warning
    This specification is experimental.
"""

    @env.macro
    def repo_link(path):
        return "[`%(path)s`](%(url)s){target=_blank}" % {"path": path, "url": "https://github.com/opentosca/opentosca-vintner/tree/main/" + path}

    @env.macro
    def autogenerated_notice(cmd, force = False):
        if not (os.getenv('MKDOCS_IS_DEV') == "true" or force): return ""
        return """
[//]: # (Do not edit! This file is autogenerated!)

!!! Warning
    Do not edit!
    This file is autogenerated using `%(cmd)s` and will be overwritten during the `release` workflow!
    (This warning is not shown once deployed)
""" % { "cmd": cmd }

    @env.macro
    def asciinema_player(cast):
        return """
<div id="%(id)s"></div>
<script>
    AsciinemaPlayer.create("%(url)s", document.getElementById("%(id)s"),{
        autoplay: true,
        preload: true,
        cols: 200,
        rows: 10,
        fit: false,
        terminalFontSize: "13px"
    });
</script>
""" % {"id": 'asciinema-player-' + cast, "url": fix_url('assets/casts/' + cast + '.cast')}
