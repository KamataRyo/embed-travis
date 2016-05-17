ESC = String.fromCharCode '27'

ansi2Html = (line, styleSets) ->

    ansi = /(.)\[(\d+;)?(\d+)*m/g
    stack = 0

    replace = (text) -> text.replace ansi, callback

    getStyleValue = (styleSet) ->
        unless styleSet? then return ''
        results = []
        for key, value of styleSet
            if value? then results.push "#{key}:#{value}"
        return results.join ';'

    callback = (match, b0, b1, b2) ->
        if ESC isnt b0 then return match
        if ('' is b2) or (null is b2) then b2 = '0'
        res = ''
        for i in [2..(arguments.length - 3)]
            code = parseInt(arguments[i]).toString()
            if code in Object.keys styleSets
                stack++
                res += '<span style="' + getStyleValue(styleSets[code]) + '">'
        return res

    return replace line + '</span>'.repeat stack



styleSets =
    0:  { 'font-weight': 'normal', 'font-style': 'normal', 'text-decoration': 'none','background-color': '#222', color: '#f1f1f1' }
    1:  { 'font-weight': 'bold' }
    3:  { 'font-style': 'italic' }
    4:  { 'text-decoration': 'underline' }
    5:  { 'animation': 'blink 1s step-end infinite', '-webkit-animation': 'blink 1s step-end infinite' }
    7:  { invert: true }
    9:  { 'text-decoration': 'line-through' }
    23: { 'font-style': 'normal' }
    24: { 'text-decoration': 'none' }
    25: { 'animation': 'none', '-webkit-animation': 'none' }
    27: { invert: false }
    29: { 'text-decoration': 'none' }
    30: { color: '#4E4E4E' } # black
    31: { color: '#FF9B93' } # red
    32: { color: '#B1FD79' } # green
    33: { color: '#FFFFB6' } # yellow
    34: { color: '#B5DCFE' } # blue
    35: { color: '#FF73FD' } # magemta
    36: { color: '#E0FFFF' } # cyan
    37: { color: '#f1f1f1' } # white
    39: { color: '#f1f1f1' } #default
    40: { 'background-color': '#4E4E4E' } # black
    41: { 'background-color': '#FF9B93' } # red
    42: { 'background-color': '#B1FD79' } # green
    43: { 'background-color': '#FFFFB6' } # yellow
    44: { 'background-color': '#B5DCFE' } # blue
    45: { 'background-color': '#FF73FD' } # magemta
    46: { 'background-color': '#E0FFFF' } # cyan
    47: { 'background-color': '#f1f1f1' } # white
    49: { 'background-color': '#222' } # default




tablify = (lines) ->
    if typeof lines is 'string' then lines = lines.split '\n'
    html = ''
    for line, index in lines
        console.log "[#{index}]#{line}"
        attr = ''
        line = line.replace /travis_(fold|time):(start|end):(.+)/g, (match, p1, p2, p3) ->
            if p1? and p2?
                attr += " data-#{p1}-#{p2}=\"#{p3}\""
            return ''

        line = ansi2Html line, styleSets
        line = line.replace new RegExp(String.fromCharCode(13),'g'), ''
        line = line.replace new RegExp(ESC,'g'), ''
        line = line.replace /\[\d?K/g, ''

        html += "<p#{attr}><a>#{index + 1}</a>#{line}</p>"
    return "<div class=\"log-body\"><pre>#{html}</pre></div>"


app = ($) ->
    $container = $('.embed-travis')
    type = if $container.data 'builds' then 'builds' else 'jobs'
    # いずれにせよ一旦requestし、metaを取得する。buildsの場合はこの時jobs_id(?)を得る
    id = $container.data type

    $.ajax {
        url: "https://s3.amazonaws.com/archive.travis-ci.org/#{type}/#{id}/log.txt"
        headers: {
            Accept: 'Accept: text/plain'
        }
    }
        .then (lines) ->
            $container.append tablify lines #synchronous

            $('p[data-fold-start]').each ->
                $ '<span>' + ($(this).data 'fold-start') + '</span>'
                    .css 'position', 'absolute'
                    .css 'display', 'block'
                    .css 'right', '85px'
                    .css 'top', '4px'
                    .css 'padding', '2px 7px 2px'
                    .css 'line-height', '10px'
                    .css 'font-size', '10px'
                    .css 'background-color', '#666'
                    .css 'border-radius', '6px'
                    .css 'color', '#bbb;'
                    .prependTo $(this)

            $('p[data-time-start]').each ->
                $p = $(this)
                until $p.data 'time-end'
                    $p = $p.next()
                duration = $p.data('time-end').match(/duration=(\d*)$/)[1] / 10000000
                $ '<span>' + Math.round(duration) / 100 + 's</span>'
                    .css 'position', 'absolute'
                    .css 'display', 'block'
                    .css 'right', '12px'
                    .css 'top', '4px'
                    .css 'padding', '2px 7px 2px'
                    .css 'line-height', '10px'
                    .css 'font-size', '10px'
                    .css 'background-color', '#666'
                    .css 'border-radius', '6px'
                    .css 'color', '#bbb;'
                    .prependTo $(this)

            $('p[data-fold-start]>a').click ->
                if $(this).parent().hasClass 'fold'
                    $(this).parent().removeClass 'fold'
                    $p = $(this).parent().next()
                    until $p.data 'fold-end'
                        $p.show()
                        $p = $p.next()
                else
                    $(this).parent().addClass 'fold'
                    $p = $(this).parent().next()
                    until $p.data 'fold-end'
                        $p.hide()
                        $p = $p.next()

jQuery(document).ready app
