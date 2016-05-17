#
# line = '[31;1mThe command "npm test" exited with 1.'
# console.log /\[([34][0-9]|[0148]);([34][0-9]|[0148])m/.test line
# console.log line.replace /\[([34][0-9]|[0148]);([34][0-9]|[0148])m/, (match,p1) ->
#     p1 + 'aaaa'
# return

styles =
    '[0m': {'font-weight': 'normal','text-decoration':'none', display: 'inline'}# ''#sgr0	Reset all attributes
    '[1m': {'font-weight': 'bold'}
    '[4m': {'text-decoration': 'underline'}
    '[8m': {display: 'inline'}
    '[20m': {}
    '[21m': {}
    '[22m': {}
    '[23m': {}
    '[24m': {}
    '[25m': {}
    '[26m': {}
    '[27m': {}
    '[28m': {}
    '[29m': {}
    '[30m': {color:'#222'} # black
    '[31m': {color:'#FF9B93'} #red
    '[32m': {color:'#B1FD79'} #green
    '[33m': {color:'#FFFFB6'} # yellow
    '[34m': {color:'#B5DCFE'} #blue
    '[35m': {color:'#FF73FD'} #magemta
    '[36m': {color:'cyan'}
    '[37m': {color:'#f1f1f1'} # white
    '[39m': {color:'#f1f1f1'} # default
    '[40m': {'background-color': 'black'}
    '[41m': {'background-color': 'red'}
    '[42m': {'background-color': 'green'}
    '[43m': {'background-color': 'yellow'}
    '[44m': {'background-color': 'blue'}
    '[45m': {'background-color': 'magenta'}
    '[46m': {'background-color': 'cyan'}
    '[47m': {'background-color': 'white'}
    '[49m': {'background-color': '#222'} # default



tablify = (lines) ->
    html = ''
    for line in lines
        # line = line.replace /\[0K/g, ''
        # fold start
        if /^travis_fold:start:/.test line
            line = line.replace /^travis_fold:start:/g, ''
        # fold end
        else if /^travis_fold:end:/.test line
            line = line.replace /^travis_fold:end:/g, ''
        # time start
        if /^travis_time:start:/.test line
            line = line.replace /^travis_time:start:/g, ''
        # time end
        if /^travis_time:end:/.test line
            line = line.replace /^travis_time:end:/g, ''

        stylePattern = /(.)(\[([234][0-9]|[0148])m|\[([234][0-9]|[0148]);([234][0-9]|[0148])m)/g
        styleStackNum = 0

        if stylePattern.test line
            line = line.replace stylePattern, (match, p1, p2, p3, p4, p5) ->
                if '%1B' isnt escape(p1)
                    return match
                if !(p4? and p5?)
                    style = (("#{key}:#{value}") for key, value of styles[p2]).join ';'
                else
                    [before, after] = ["[#{p4}m", "[#{p5}m"]
                    style  = (("#{key}:#{value}") for key, value of styles[before]).join ';'
                    style += ';' + (("#{key}:#{value}") for key, value of styles[after]).join ';'
                styleStackNum++
                return "<span style=\"#{style}\">"

            line += '</span>'.repeat styleStackNum



        html += "<p><a></a>#{line}</p>"
    return "<div class=\"log-body\"><pre>#{html}</pre></div>"


app = ($) ->
    $container = $('.embed-travis')
    # name = $container.data 'name'
    # repo = $container.data 'repo'
    type = if $container.data 'builds' then 'builds' else 'jobs'
    id = $container.data type

    $.ajax {
        url: "https://s3.amazonaws.com/archive.travis-ci.org/#{type}/#{id}/log.txt"
        headers: {
            Accept: 'Accept: text/plain'
        }
    }
        .then (lines) ->
            $container.append tablify lines.split '\n'

jQuery(document).ready app
