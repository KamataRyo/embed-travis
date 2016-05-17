
tablify = (lines) ->
    if typeof lines is 'string' then lines = lines.split '\n'
    html = ''
    for line, index in lines
        attr = ''
        line = line.replace /travis_(fold|time):(start|end):(.+)/g, (match, p1, p2, p3) ->
            if p1? and p2?
                attr += " data-#{p1}-#{p2}=\"#{p3}\""
            return ''

        line = ansi2html(line)
        line = line.replace new RegExp(String.fromCharCode(13),'g'), ''
        line = line.replace new RegExp(String.fromCharCode(27),'g'), ''
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
