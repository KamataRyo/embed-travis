
ansi2Html = (line, styleSets) ->

    ansi = /(.)\[(\d+;)?(\d+)*m/g
    ESC = String.fromCharCode '27'
    stack = 0

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
        for i in [2..(arguments.length - 3)] #exclude 'offset' and 'string' arguments
            code = parseInt(arguments[i]).toString()
            if code in Object.keys styleSets
                stack += 1
                res += '<span style="' + getStyleValue(styleSets[code]) + '">'
        return res

    return (line.replace ansi, callback) + '</span>'.repeat stack



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




formatLines = (lines) ->
    if typeof lines is 'string' then lines = lines.split '\n'
    html = ''
    ESC = String.fromCharCode 27
    CR = String.fromCharCode 13
    for line, index in lines

        attr = ''
        line = line.replace /travis_(fold|time):(start|end):(.+)/g, (match, p1, p2, p3) ->
            if p1? and p2?
                attr += " data-#{p1}-#{p2}=\"#{p3}\""
            return ''

        line = ansi2Html line, styleSets
        line = line.replace new RegExp(CR,'g'), ''
        line = line.replace new RegExp(ESC,'g'), ''
        line = line.replace /\[\d?K/g, ''

        html += "<p#{attr}><a>#{index + 1}</a>#{line}</p>"

    return html



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
            $container.append $ '<div class="travis-log-body"><pre>' + formatLines(lines) + '</pre></div>'

            $('.travis-log-body p[data-fold-start]').each ->
                $(this).prepend $ '<span class="travis-info travis-fold-start">' + ($(this).data 'fold-start') + '</span>'

            $('.travis-log-body p[data-time-start]').each ->
                $paragraph = $(this)
                until $paragraph.data 'time-end'
                    $paragraph = $paragraph.next()
                duration = Math.round($paragraph.data('time-end').match(/duration=(\d*)$/)[1] / 10000000) / 100
                $(this).prepend $ "<span class=\"travis-info travis-time-start\">#{duration}s</span>"


            switchFold = ->
                close = 'travis-fold-close'
                open = 'travis-fold-open'
                $paragraph = $(this).parent()

                # open
                if $paragraph.hasClass close
                    $paragraph
                        .removeClass close
                        .addClass open
                    $next = $paragraph.next()
                    until ($next.data 'fold-end') or ! $next?
                        $next.show()
                        $next = $next.next()
                # close
                else
                    $paragraph
                        .removeClass open
                        .addClass close
                    $next = $paragraph.next()
                    until ($next.data 'fold-end') or ! $next?
                        $next.hide()
                        $next = $next.next()


            $foldHandlers = $('.travis-log-body p[data-fold-start]>a')
            # fold at first
            switchFold.apply $foldHandlers
            # click to switch
            $foldHandlers.click switchFold

            $('.travis-log-body p').click ->
                $('p').each ->
                    $(this).removeClass 'travis-active-line'
                $(this).addClass 'travis-active-line'

if module?
    module.exports = { ansi2Html, formatLines }
else if window?
    jQuery(document).ready app
