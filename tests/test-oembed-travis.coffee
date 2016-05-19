should = require 'should'
ESC = String.fromCharCode 27
CR = String.fromCharCode 13

{ util, ansi2Html, formatLines } = require '../js/oembed-travis'

styleSets =
    34: {dir34:'val34'}
    33: {dir33:'val33'}
    1: {dir1_1:'val1_1',dir1_2:'val1_2'}
    0: {dir0:'val0'}


describe 'test of util', ->
    describe 'test of nsec2sec', ->
        it 'should return correct value', ->
            util.nsec2sec 2112345678
                .should.exactly 2.11

describe 'test of ansi2Html', ->

    it 'should not style up without escape code', ->
        content = 'Linux Version'
        line = "[34m[1m#{content}[0m"

        ansi2Html line, styleSets
            .should.exactly "[34m[1m#{content}[0m"


    it 'should style up terminal color code', ->
        content = 'Linux Version'
        line = "#{ESC}[34m#{content}#{ESC}[0m"

        ansi2Html line, styleSets
            .should.exactly "<span style=\"dir34:val34\">#{content}<span style=\"dir0:val0\"></span></span>"


    it 'should style up terminal color code', ->
        content = 'Linux Version'
        line = "#{ESC}[34m#{ESC}[1m#{content}#{ESC}[0m"

        ansi2Html line, styleSets
            .should.exactly "<span style=\"dir34:val34\"><span style=\"dir1_1:val1_1;dir1_2:val1_2\">#{content}<span style=\"dir0:val0\"></span></span></span>"


    it 'should style up terminal color code', ->
        content = 'content'
        line = "#{ESC}[33;1m#{content}#{ESC}[0m"

        ansi2Html line, styleSets
            .should.exactly "<span style=\"dir33:val33\"><span style=\"dir1_1:val1_1;dir1_2:val1_2\">#{content}<span style=\"dir0:val0\"></span></span></span>"


describe 'test of formatLines, parseTravis', ->

    it 'should format lines', ->
        lines = "abc\ndefghi\njklmn"
        formatLines lines
            .should.exactly '<div class="travis-log-body"><div class="travis-pre"><p><a>1</a>abc</p><p><a>2</a>defghi</p><p><a>3</a>jklmn</p></div></div>'

    for action in ['fold', 'time']
        for state in ['start', 'end']
            it "should detect travisCI grammer '#{action}-#{state}'", ->
                lines = "abc\ntravis_#{action}:#{state}:label#{CR}#{ESC}[0K\njklmn"
                formatLines lines
                    .should.exactly "<div class=\"travis-log-body\"><div class=\"travis-pre\"><p><a>1</a>abc</p><p data-#{action}-#{state}=\"label\"><a>2</a></p><p><a>3</a>jklmn</p></div></div>"
