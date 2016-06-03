# some utilities
util =
    nsec2sec: (nsec) -> Math.round( nsec / 10000000) / 100

# terminal codes to Html
ansi2Html = (line, styleSets) ->
    ansi = /(.)\[(\d+;)?(\d+)*m/g
    ESC = String.fromCharCode '27'
    stack = ''

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
                stack += '</span>'
                res += '<span style="' + getStyleValue(styleSets[code]) + '">'
        return res

    return (line.replace ansi, callback) + stack

# detect and process travis control code
formatLines = (lines) ->
    ESC = String.fromCharCode 27
    CR = String.fromCharCode 13
    LF = String.fromCharCode 10
    lines = lines.replace '[0G' + CR + LF, ''
    lines = lines.split LF
    html = ''

    for line, index in lines
        # console.log "#{index + 1}: #{escape line}"
        # console.log /^%1B%5B0m(%1B%5B0G([-/]|%[75]C))+%1B%5B0G%0D$/.test escape line
        attr = ''
        line = line.replace /travis_(fold|time):(start|end):(.+)/g, (match, p1, p2, p3) ->
            if p1? and p2?
                attr += " data-#{p1}-#{p2}=\"#{p3}\""
            return ''
        line = ansi2Html(line, styleSets)
        line = line.replace new RegExp(CR,'g'), ''
        line = line.replace new RegExp(ESC,'g'), ''
        line = line.replace /\[\d?[KG]/g, '' # maybe this erases non-escaped line

        html += "<p#{attr}><a>#{index + 1}</a>#{line}</p>"

    return "<div class=\"travis-log-body\"><div class=\"travis-pre\">#{html}</div></div>"


# define terminal code styles
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

# for test
if window? then $ = jQuery


addFoldLabel = ($container, selector) ->
    $container.find(selector).each ->
        $(this).prepend $ '<span class="travis-info travis-fold-start">' + ($(this).data 'fold-start') + '</span>'


addTimeLabel = ($container, selector) ->
    $container.find(selector).each ->
        $n = $(this)
        until ($n.data 'time-end') or ($n.length is 0)
            $n = $n.next()
        if $n.data('time-end')
            duration = util.nsec2sec ('') + $n.data('time-end').match(/duration=(\d*)$/)[1]
            if duration then $(this).prepend $ "<span class=\"travis-info travis-time-start\">#{duration}s</span>"


toggle = ($handle, bool) ->
    [opened, closed] = ['travis-fold-close', 'travis-fold-open']
    $handle.removeClass(if bool then closed else opened)
    $handle.addClass(if bool then opened else closed)
    $n = $handle.next()
    label = $handle.data 'fold-start'
    until (label is $n.data 'fold-end') or ($n.data 'fold-start')? or ($n.length is 0)
        $n[if bool then 'show' else 'hide']()
        $n = $n.next()


addFoldHandlers = ($container, selector) ->
    [opened, closed] = ['travis-fold-close', 'travis-fold-open']
    $container.find(selector)
        .addClass closed
        .each ->
            toggle($(this).parent(), false)
            $(this).click ->
                    $p = $(this).parent()
                    if $p.hasClass opened then toggle($p, false) else toggle($p, true)


activateLine = ($container, selector, line) ->
    $pre = $container.find("#{selector} .travis-pre")
    $p   = $container.find("#{selector} p").eq(line - 1)
    if $p.length is 0 then return
    $p.addClass 'travis-given-active-line'
    if $p.css('display') is 'none'
        $pointer = $p
        until ($pointer.data 'fold-start') or ($pointer.length is 0)
            $pointer = $pointer.prev()
        toggle($pointer, true)
    bodyHeight = $pre.height()
    lineTop    = $p.position().top - $pre.position().top
    lineHeight = $p.height()
    d = lineTop - (bodyHeight / 2) + (lineHeight / 2)
    $pre.scrollTop d


addFooter = ($container, selector, arg) ->
    {author, repo, line, url} = arg
    if author and repo
        content = "#{author}/#{repo}"
        # need to inject branch information to show badge
        # badge = "<img class=\"travis-badge\" src=\"https://api.travis-ci.org/#{author}/#{repo}.svg?branch=#{branch}\" alt=\"state\" />"
    else
        content = 'This repository'
        badge = ''
    # check if line is valid(not be over all line length)
    if line and $container.find("#{selector} p").eq(line - 1).length > 0
        content = "#{content}#L#{line}"
    if url
        content = "<a class=\"travis-link-text\" href=\"#{url}\">#{content}</a>"
    $container.append $ """
    <div class=\"travis-log-footer\"><div class="travis-footer-text">
        #{content} built with <a class="travis-link-text" href=\"https://travis-ci.org\">Travis CI</a>.
    </div></div>
    """


# main module
main = ->
    $('.oembed-travis').each ->
        $container = $ this
        if $container.children > 0 then return
        url    = $container.data 'url'
        author = $container.data 'author'
        repo   = $container.data 'repo'
        type   = if $container.data 'builds' then 'builds' else 'jobs'
        id     = $container.data type
        line   = $container.data 'line'

        if type is 'builds'
            requestOptions =
                url: "https://api.travis-ci.org/builds/#{id}"
                headers:
                    Accept: 'application/vnd.travis-ci.2+json'

            $.ajax requestOptions
                .then ({jobs}) ->
                    requestOptions =
                        url: "https://s3.amazonaws.com/archive.travis-ci.org/jobs/#{jobs[0].id}/log.txt"
                        headers:
                            Accept: 'text/plain'
                        timeout: 5000

                    $.ajax requestOptions
                        .then (lines) ->
                            $container.append $ formatLines lines
                            addFoldLabel $container, '.travis-log-body p[data-fold-start]'
                            addTimeLabel $container, '.travis-log-body p[data-time-start]'
                            addFoldHandlers $container, '.travis-log-body p[data-fold-start]>a'
                            if line then activateLine $container, '.travis-log-body', line
                            addFooter $container, '.travis-log-body', {author, repo, line, url}


        else
            requestOptions =
                url: "https://s3.amazonaws.com/archive.travis-ci.org/jobs/#{id}/log.txt"
                headers:
                    Accept: 'text/plain'
                timeout: 5000


            $.ajax requestOptions
                .then (lines) ->
                    $container.append $ formatLines lines
                    addFoldLabel $container, '.travis-log-body p[data-fold-start]'
                    addTimeLabel $container, '.travis-log-body p[data-time-start]'
                    addFoldHandlers $container, '.travis-log-body p[data-fold-start]>a'
                    if line then activateLine $container, '.travis-log-body', line
                    addFooter $container, '.travis-log-body', {author, repo, line, url}




# engine handling
if module?
    # export for test
    module.exports = { util, ansi2Html, formatLines }
else if window?
    # exec on browser
    $(document).ready main
