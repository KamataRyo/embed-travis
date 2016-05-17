ESC = String.fromCharCode '27'

stylizeLine = (line, {prefix, userClass} = {})->

    if prefix?
        prefix = "#{prefix}-"
    else
        prefix = ''

    pattern = /((.)\[(\d+)m)+/g

    if pattern.test line
        line = line.replace pattern, (match, p1, p2, offset, string) ->
            if ESC isnt p2 then return match

            classStuck = []
            console.log p2.split ESC
            classStuck.push "#{prefix}style_#{p3}m"
            if classStuck.length is 1
                return "<span class=\"%s\">"
            else
                return ''

        if userClass? and ('' isnt userClass)
            classStuck.push userClass

        line = line.replace('%s', classStuck.join(' ')) + '</span>'



lib = { stylizeLine }
if module?
    module.exports = lib
else if window?
    window.embedTravisLib = lib
