var MAP

function parse(input, files, keywords) {
    var status = {
            generated: {
                line: 0,
                column: 0
            },
            sourceIndex: 0,
            original: {
                line: 0,
                column: 0
            },
            nameIndex: 0
        }

    // mappings: "AAAAA,BBBBB;CCCCC"
    function parseMappings(mappings) {
        var lineMappings = mappings.split(';'),
            lines = []

        lineMappings.forEach(function (line) {
            var pointMappings

            if (line.length === 0) {
                status.generated.line++
                return
            }

            pointMappings = line.split(',')
            lines.push(pointMappings.map(parsePoint))
            status.generated.line++
            status.generated.column = 0
        })

        return lines
    }

    // point: "AAAAA"
    function parsePoint(point) {
        var values = []
        var value
        var i = 0
        var valueInfo = {}
        var pointInfo = {}

        while (point.length && i < 64) {
            i++
            valueInfo = extractValue(point)
            point = point.substr(valueInfo.length)
            value = valueInfo.value
            values.push(value)
        }


        status.generated.column += values[0]
        pointInfo.generated = {}
        pointInfo.generated.line = status.generated.line
        pointInfo.generated.column = status.generated.column


        if (values.length <= 1) {
            return pointInfo
        }

        status.sourceIndex += values[1]
        status.original.line += values[2]
        status.original.column += values[3]

        pointInfo.source = files[status.sourceIndex]
        pointInfo.original = {}
        pointInfo.original.line = status.original.line
        pointInfo.original.column = status.original.column

        if (values.length <= 4) {
            return pointInfo
        }

        status.nameIndex += values[4]
        pointInfo.name = keywords[status.nameIndex]

        return pointInfo
    }

    // [A-Z] ->  0-25,
    // [a-z] -> 26-51,
    // [0-9] -> 52-61,
    //   +   ->    62,
    //   /   ->    63
    function convertCharToInt(c) {
        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.search(c)
    }

    // 100001, true  ->  continuation,  sign, 0
    // 000010, false -> !continuation,      , 2
    // 110010, true  ->  continuation, !sign, 9
    function convertNumberToInfo(n, first) {
        var continuation = parseInt(100000, 2) & n
        var value = parseInt(11111, 2) & n
        var sign

        if (first) {
            sign = 1 & n
            value = value >> 1
        }

        return {
            first: !!first,
            sign: !!sign,
            continuation: continuation,
            value: value
        }
    }

    // A  0 000000   0
    // B  1 000001  -0
    // C  2 000010   1
    // D  3 000011  -1
    // E             2
    // F            -2
    // G             3
    // H            -3
    // I             4
    // J            -4
    // K             5
    // L            -5
    // MOQSU         6~ 10
    // NPRTV        -6~-10
    // WYace        11~ 15
    // XZbdf       -11~-15
    // 
    // g 32 100000   0 + ?
    // hijkl...
    function extractValue(point) {
        var length = point.length
        var first = true
        var step = 0
        var totalValue = 0
        var sign = 0

        // var firstChar = point[0]
        // var firstNumber = convertCharToInt(firstChar)
        // var firstMap = [0, 0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, 8, -8, 9, -9, 10, -10, 11, -11, 12, -12, 13, -13, 14, -14, 15, -15]

        // if (firstNumber <= convertCharToInt('f')) {
        //     console.log('first', firstChar, '->', firstMap[firstNumber], firstNumber.toString(2), Math.floor(Math.random() * 10))
        //     return {
        //         length: 1,
        //         value: firstMap[firstNumber]
        //     }
        // }

        for (var i = 0; i < length; i++) {
            var c = point[i]
            var n = convertCharToInt(c)
            var info = convertNumberToInfo(n, first)

            // console.log('info', c, n.toString(2), info)
            totalValue += info.value * Math.pow(2, step)

            if (info.first) {
                sign = info.sign
            }

            step += 6
            if (info.first) {
                step--
            }
            if (info.continuation) {
                step--
            }
            // console.log('step', step)

            if (info.continuation) {
                first = false
            }
            else {
                first = true
                break
            }
        }

        // console.log('VLQ:', i + 1, totalValue, sign)

        if (sign) {
            totalValue = -totalValue
        }

        return {
            length: i + 1,
            value: totalValue
        }
    }

    return parseMappings(input)
}

function log(result) {
    for (var line = 0; line < result.length; line++) {
        var lineResult = result[line]
        for (var col = 0; col < lineResult.length; col++) {
            var colResult = lineResult[col]

            if (!colResult.source) {
                continue
            }

            console.log('[{gline}, {gcol}] {source}: {oline}, {ocol} {name}'.
                replace('{gline}', colResult.generated.line + 1).
                replace('{gcol}', colResult.generated.column + 1).
                replace('{source}', colResult.source).
                replace('{oline}', colResult.original.line + 1).
                replace('{ocol}', colResult.original.column + 1).
                replace('{name}', colResult.name ? ('-> ' + colResult.name) : ''))
        }
    }
}

function showMap(map) {
    var compiledRoot = $('#compiled-container'),
        sourcesRoot = $('#sources-container'),
        sourcesList = [],
        sourcesPres = [],
        compiledPre,
        logger = $('#logger'),
        length = map.sources.length + 1

    function done() {
        length--
        if (length === 0) {
            sourcesList.forEach(function (codeRoot) {
                sourcesRoot.append(codeRoot)
            })
        }
    }

    function highlight(point) {
        var gLine = parseInt(point.generated.line) || 0,
            gCol = parseInt(point.generated.column) || 0,
            oLine = parseInt(point.original.line) || 0,
            oCol = parseInt(point.original.column) || 0,
            source = point.source.toString() || ' ',
            output

        $('.mark').removeClass('mark')

        compiledPre.find('[line="' + gLine +'"][col="' + gCol + '"]').addClass('mark')
        sourcesRoot.find('[filename="' + source + '"]').find('[line="' + oLine +'"][col="' + oCol + '"]').addClass('mark')

        output = ['highlight: [', gLine + 1, ',', gCol + 1, ']', source, ':', oLine, ',', oCol, point.name]
        logger.text(output.join(' '))

        console.log(output)
    }

    function bindCompiled(pre) {
        compiledPre = pre
        pre.find('span').click(function () {
            var span = $(this),
                line = parseInt(span.attr('line')),
                column = parseInt(span.attr('col')),
                lastPoint

            map.result.forEach(function (points) {
                points.forEach(function (point) {
                    if (point.generated.line <= line && point.generated.column <= column) {
                        lastPoint = point
                    }
                })
            })

            if (lastPoint) {
                highlight(lastPoint)
            }
        })
    }

    function bindSource(pre, index) {
        sourcesPres[index] = pre
        pre.find('span').click(function () {
            var span = $(this),
                line = span.attr('line'),
                column = span.attr('col'),
                source = pre.attr('filename'),
                lastPoint

            map.result.forEach(function (points) {
                points.forEach(function (point) {
                    if (point.source === source && point.original &&
                        point.original.line <= line && point.original.column <= column
                    ) {
                        lastPoint = point
                    }
                })
            })

            if (lastPoint) {
                highlight(lastPoint)
            }
        })
    }

    function bind(pre, code, index) {
        var codeLength = code.length,
            line = 0,
            col = 0

        pre.html('')

        for (var i = 0; i < codeLength; i++) {
            var span = $('<span></span>').text(code[i])

            span.attr('index', i).attr('line', line).attr('col', col)
            pre.append(span)

            col++
            if (code[i] === '\n') {
                line++
                col = 0
            }
        }

        if (index >= 0) {
            bindSource(pre, index)
        }
        else {
            bindCompiled(pre)
        }
    }

    function build(filename, code, index) {
        var codeRoot = $('<div class="code-container"><h3></h3><pre></pre></div>'),
            title = codeRoot.find('h3').text(filename),
            pre = codeRoot.find('pre').attr('filename', filename)

        if (index >= 0) {
            sourcesList[index] = codeRoot
        }
        else {
            compiledRoot.append(codeRoot)
        }

        bind(pre, code, index)
    }

    $.get(map.file, function (code) {
        build(map.file, code, -1)
        done()
    })

    map.sources.forEach(function (source, i) {
        $.get(source, function (code) {
            build(source, code, i)
            done()
        }, 'html')
    })
}

function start() {

    $.getJSON('compiled.map', function (map) {
        var result


        MAP = map
        MAP.result = parse(MAP.mappings, MAP.sources, MAP.names)

        $('#files').text(MAP.sources)
        $('#names').text(MAP.names)

        log(MAP.result)
        showMap(MAP)
    })
}

start()