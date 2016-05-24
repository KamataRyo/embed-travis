(function() {
  var $, activateLine, addFoldHandlers, addFoldLabel, addFooter, addTimeLabel, ansi2Html, formatLines, main, styleSets, toggle, util,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  util = {
    nsec2sec: function(nsec) {
      return Math.round(nsec / 10000000) / 100;
    }
  };

  ansi2Html = function(line, styleSets) {
    var ESC, ansi, callback, getStyleValue, stack;
    ansi = /(.)\[(\d+;)?(\d+)*m/g;
    ESC = String.fromCharCode('27');
    stack = '';
    getStyleValue = function(styleSet) {
      var key, results, value;
      if (styleSet == null) {
        return '';
      }
      results = [];
      for (key in styleSet) {
        value = styleSet[key];
        if (value != null) {
          results.push(key + ":" + value);
        }
      }
      return results.join(';');
    };
    callback = function(match, b0, b1, b2) {
      var code, i, j, ref, res;
      if (ESC !== b0) {
        return match;
      }
      if (('' === b2) || (null === b2)) {
        b2 = '0';
      }
      res = '';
      for (i = j = 2, ref = arguments.length - 3; 2 <= ref ? j <= ref : j >= ref; i = 2 <= ref ? ++j : --j) {
        code = parseInt(arguments[i]).toString();
        if (indexOf.call(Object.keys(styleSets), code) >= 0) {
          stack += '</span>';
          res += '<span style="' + getStyleValue(styleSets[code]) + '">';
        }
      }
      return res;
    };
    return (line.replace(ansi, callback)) + stack;
  };

  formatLines = function(lines) {
    var CR, ESC, attr, html, index, j, len, line;
    if (typeof lines === 'string') {
      lines = lines.split('\n');
    }
    html = '';
    ESC = String.fromCharCode(27);
    CR = String.fromCharCode(13);
    for (index = j = 0, len = lines.length; j < len; index = ++j) {
      line = lines[index];
      attr = '';
      line = line.replace(/travis_(fold|time):(start|end):(.+)/g, function(match, p1, p2, p3) {
        if ((p1 != null) && (p2 != null)) {
          attr += " data-" + p1 + "-" + p2 + "=\"" + p3 + "\"";
        }
        return '';
      });
      line = ansi2Html(line, styleSets);
      line = line.replace(new RegExp(CR, 'g'), '');
      line = line.replace(new RegExp(ESC, 'g'), '');
      line = line.replace(/\[\d?[KG]/g, '');
      html += "<p" + attr + "><a>" + (index + 1) + "</a>" + line + "</p>";
    }
    return "<div class=\"travis-log-body\"><div class=\"travis-pre\">" + html + "</div></div>";
  };

  styleSets = {
    0: {
      'font-weight': 'normal',
      'font-style': 'normal',
      'text-decoration': 'none',
      'background-color': '#222',
      color: '#f1f1f1'
    },
    1: {
      'font-weight': 'bold'
    },
    3: {
      'font-style': 'italic'
    },
    4: {
      'text-decoration': 'underline'
    },
    5: {
      'animation': 'blink 1s step-end infinite',
      '-webkit-animation': 'blink 1s step-end infinite'
    },
    7: {
      invert: true
    },
    9: {
      'text-decoration': 'line-through'
    },
    23: {
      'font-style': 'normal'
    },
    24: {
      'text-decoration': 'none'
    },
    25: {
      'animation': 'none',
      '-webkit-animation': 'none'
    },
    27: {
      invert: false
    },
    29: {
      'text-decoration': 'none'
    },
    30: {
      color: '#4E4E4E'
    },
    31: {
      color: '#FF9B93'
    },
    32: {
      color: '#B1FD79'
    },
    33: {
      color: '#FFFFB6'
    },
    34: {
      color: '#B5DCFE'
    },
    35: {
      color: '#FF73FD'
    },
    36: {
      color: '#E0FFFF'
    },
    37: {
      color: '#f1f1f1'
    },
    39: {
      color: '#f1f1f1'
    },
    40: {
      'background-color': '#4E4E4E'
    },
    41: {
      'background-color': '#FF9B93'
    },
    42: {
      'background-color': '#B1FD79'
    },
    43: {
      'background-color': '#FFFFB6'
    },
    44: {
      'background-color': '#B5DCFE'
    },
    45: {
      'background-color': '#FF73FD'
    },
    46: {
      'background-color': '#E0FFFF'
    },
    47: {
      'background-color': '#f1f1f1'
    },
    49: {
      'background-color': '#222'
    }
  };

  if (typeof window !== "undefined" && window !== null) {
    $ = jQuery;
  }

  addFoldLabel = function($container, selector) {
    return $container.find(selector).each(function() {
      return $(this).prepend($('<span class="travis-info travis-fold-start">' + ($(this).data('fold-start')) + '</span>'));
    });
  };

  addTimeLabel = function($container, selector) {
    return $container.find(selector).each(function() {
      var $n, duration;
      $n = $(this);
      while (!(($n.data('time-end')) || ($n.length === 0))) {
        $n = $n.next();
      }
      if ($n.data('time-end')) {
        duration = util.nsec2sec('' + $n.data('time-end').match(/duration=(\d*)$/)[1]);
        if (duration) {
          return $(this).prepend($("<span class=\"travis-info travis-time-start\">" + duration + "s</span>"));
        }
      }
    });
  };

  toggle = function($handle, bool) {
    var $n, closed, label, opened, ref, results1;
    ref = ['travis-fold-close', 'travis-fold-open'], opened = ref[0], closed = ref[1];
    $handle.removeClass(bool ? closed : opened);
    $handle.addClass(bool ? opened : closed);
    $n = $handle.next();
    label = $handle.data('fold-start');
    results1 = [];
    while (!((label === $n.data('fold-end')) || (($n.data('fold-start')) != null) || ($n.length === 0))) {
      $n[bool ? 'show' : 'hide']();
      results1.push($n = $n.next());
    }
    return results1;
  };

  addFoldHandlers = function($container, selector) {
    var closed, opened, ref;
    ref = ['travis-fold-close', 'travis-fold-open'], opened = ref[0], closed = ref[1];
    return $container.find(selector).addClass(closed).each(function() {
      toggle($(this).parent(), false);
      return $(this).click(function() {
        var $p;
        $p = $(this).parent();
        if ($p.hasClass(opened)) {
          return toggle($p, false);
        } else {
          return toggle($p, true);
        }
      });
    });
  };

  activateLine = function($container, selector, line) {
    var $p, $pointer, $pre, bodyHeight, d, lineHeight, lineTop;
    $pre = $container.find(selector + " .travis-pre");
    $p = $container.find(selector + " p").eq(line - 1);
    if ($p.length === 0) {
      return;
    }
    $p.addClass('travis-given-active-line');
    if ($p.css('display') === 'none') {
      $pointer = $p;
      while (!(($pointer.data('fold-start')) || ($pointer.length === 0))) {
        $pointer = $pointer.prev();
      }
      toggle($pointer, true);
    }
    bodyHeight = $pre.height();
    lineTop = $p.position().top - $pre.position().top;
    lineHeight = $p.height();
    d = lineTop - (bodyHeight / 2) + (lineHeight / 2);
    return $pre.scrollTop(d);
  };

  addFooter = function($container, selector, arg) {
    var author, badge, content, line, repo, url;
    author = arg.author, repo = arg.repo, line = arg.line, url = arg.url;
    if (author && repo) {
      content = author + "/" + repo;
    } else {
      content = 'This repository';
      badge = '';
    }
    if (line && $container.find(selector + " p").eq(line - 1).length > 0) {
      content = content + "#L" + line;
    }
    if (url) {
      content = "<a href=\"" + url + "\">" + content + "</a>";
    }
    return $container.append($("<div class=\"travis-log-footer\"><h2 class=\"travis-footer-text\">\n    " + content + " built with <a href=\"https://travis-ci.org\">Travis CI</a>.\n</h2></div>"));
  };

  main = function() {
    return $('.oembed-travis').each(function() {
      var $container, author, id, line, repo, requestOptions, type, url;
      $container = $(this);
      if ($container.children > 0) {
        return;
      }
      url = $container.data('url');
      author = $container.data('author');
      repo = $container.data('repo');
      type = $container.data('builds') ? 'builds' : 'jobs';
      id = $container.data(type);
      line = $container.data('line');
      if (type === 'builds') {
        requestOptions = {
          url: "https://api.travis-ci.org/builds/" + id,
          headers: {
            Accept: 'application/vnd.travis-ci.2+json'
          }
        };
        return $.ajax(requestOptions).then(function(arg1) {
          var jobs;
          jobs = arg1.jobs;
          requestOptions = {
            url: "https://s3.amazonaws.com/archive.travis-ci.org/jobs/" + jobs[0].id + "/log.txt",
            headers: {
              Accept: 'text/plain'
            },
            timeout: 5000
          };
          return $.ajax(requestOptions).then(function(lines) {
            $container.append($(formatLines(lines)));
            addFoldLabel($container, '.travis-log-body p[data-fold-start]');
            addTimeLabel($container, '.travis-log-body p[data-time-start]');
            addFoldHandlers($container, '.travis-log-body p[data-fold-start]>a');
            if (line) {
              activateLine($container, '.travis-log-body', line);
            }
            return addFooter($container, '.travis-log-body', {
              author: author,
              repo: repo,
              line: line,
              url: url
            });
          });
        });
      } else {
        requestOptions = {
          url: "https://s3.amazonaws.com/archive.travis-ci.org/jobs/" + id + "/log.txt",
          headers: {
            Accept: 'text/plain'
          },
          timeout: 5000
        };
        return $.ajax(requestOptions).then(function(lines) {
          $container.append($(formatLines(lines)));
          addFoldLabel($container, '.travis-log-body p[data-fold-start]');
          addTimeLabel($container, '.travis-log-body p[data-time-start]');
          addFoldHandlers($container, '.travis-log-body p[data-fold-start]>a');
          if (line) {
            activateLine($container, '.travis-log-body', line);
          }
          return addFooter($container, '.travis-log-body', {
            author: author,
            repo: repo,
            line: line,
            url: url
          });
        });
      }
    });
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = {
      util: util,
      ansi2Html: ansi2Html,
      formatLines: formatLines
    };
  } else if (typeof window !== "undefined" && window !== null) {
    $(document).ready(main);
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzL29lbWJlZC10cmF2aXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSw4SEFBQTtJQUFBOztFQUFBLElBQUEsR0FDSTtJQUFBLFFBQUEsRUFBVSxTQUFDLElBQUQ7YUFBVSxJQUFJLENBQUMsS0FBTCxDQUFZLElBQUEsR0FBTyxRQUFuQixDQUFBLEdBQStCO0lBQXpDLENBQVY7OztFQUdKLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxTQUFQO0FBQ1IsUUFBQTtJQUFBLElBQUEsR0FBTztJQUNQLEdBQUEsR0FBTSxNQUFNLENBQUMsWUFBUCxDQUFvQixJQUFwQjtJQUNOLEtBQUEsR0FBUTtJQUVSLGFBQUEsR0FBZ0IsU0FBQyxRQUFEO0FBQ1osVUFBQTtNQUFBLElBQU8sZ0JBQVA7QUFBc0IsZUFBTyxHQUE3Qjs7TUFDQSxPQUFBLEdBQVU7QUFDVixXQUFBLGVBQUE7O1FBQ0ksSUFBRyxhQUFIO1VBQWUsT0FBTyxDQUFDLElBQVIsQ0FBZ0IsR0FBRCxHQUFLLEdBQUwsR0FBUSxLQUF2QixFQUFmOztBQURKO0FBRUEsYUFBTyxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWI7SUFMSztJQU9oQixRQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsRUFBUixFQUFZLEVBQVosRUFBZ0IsRUFBaEI7QUFDUCxVQUFBO01BQUEsSUFBRyxHQUFBLEtBQVMsRUFBWjtBQUFvQixlQUFPLE1BQTNCOztNQUNBLElBQUcsQ0FBQyxFQUFBLEtBQU0sRUFBUCxDQUFBLElBQWMsQ0FBQyxJQUFBLEtBQVEsRUFBVCxDQUFqQjtRQUFtQyxFQUFBLEdBQUssSUFBeEM7O01BQ0EsR0FBQSxHQUFNO0FBQ04sV0FBUywrRkFBVDtRQUNJLElBQUEsR0FBTyxRQUFBLENBQVMsU0FBVSxDQUFBLENBQUEsQ0FBbkIsQ0FBc0IsQ0FBQyxRQUF2QixDQUFBO1FBQ1AsSUFBRyxhQUFRLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBWixDQUFSLEVBQUEsSUFBQSxNQUFI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WixDQUFGLENBQWxCO1VBQ0EsWUFBQSxDQUFhLFVBQWIsRUFBeUIscUNBQXpCO1VBQ0EsWUFBQSxDQUFhLFVBQWIsRUFBeUIscUNBQXpCO1VBQ0EsZUFBQSxDQUFnQixVQUFoQixFQUE0Qix1Q0FBNUI7VUFDQSxJQUFHLElBQUg7WUFBYSxZQUFBLENBQWEsVUFBYixFQUF5QixrQkFBekIsRUFBNkMsSUFBN0MsRUFBYjs7aUJBQ0EsU0FBQSxDQUFVLFVBQVYsRUFBc0Isa0JBQXRCLEVBQTBDO1lBQUMsUUFBQSxNQUFEO1lBQVMsTUFBQSxJQUFUO1lBQWUsTUFBQSxJQUFmO1lBQXFCLEtBQUEsR0FBckI7V0FBMUM7UUFORSxDQURWLEVBaENKOztJQVZxQixDQUF6QjtFQURHOztFQXdEUCxJQUFHLGdEQUFIO0lBRUksTUFBTSxDQUFDLE9BQVAsR0FBaUI7TUFBRSxNQUFBLElBQUY7TUFBUSxXQUFBLFNBQVI7TUFBbUIsYUFBQSxXQUFuQjtNQUZyQjtHQUFBLE1BR0ssSUFBRyxnREFBSDtJQUVELENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxLQUFaLENBQWtCLElBQWxCLEVBRkM7O0FBaE9MIiwiZmlsZSI6ImpzL29lbWJlZC10cmF2aXMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIHNvbWUgdXRpbGl0aWVzXG51dGlsID1cbiAgICBuc2VjMnNlYzogKG5zZWMpIC0+IE1hdGgucm91bmQoIG5zZWMgLyAxMDAwMDAwMCkgLyAxMDBcblxuIyB0ZXJtaW5hbCBjb2RlcyB0byBIdG1sXG5hbnNpMkh0bWwgPSAobGluZSwgc3R5bGVTZXRzKSAtPlxuICAgIGFuc2kgPSAvKC4pXFxbKFxcZCs7KT8oXFxkKykqbS9nXG4gICAgRVNDID0gU3RyaW5nLmZyb21DaGFyQ29kZSAnMjcnXG4gICAgc3RhY2sgPSAnJ1xuXG4gICAgZ2V0U3R5bGVWYWx1ZSA9IChzdHlsZVNldCkgLT5cbiAgICAgICAgdW5sZXNzIHN0eWxlU2V0PyB0aGVuIHJldHVybiAnJ1xuICAgICAgICByZXN1bHRzID0gW11cbiAgICAgICAgZm9yIGtleSwgdmFsdWUgb2Ygc3R5bGVTZXRcbiAgICAgICAgICAgIGlmIHZhbHVlPyB0aGVuIHJlc3VsdHMucHVzaCBcIiN7a2V5fToje3ZhbHVlfVwiXG4gICAgICAgIHJldHVybiByZXN1bHRzLmpvaW4gJzsnXG5cbiAgICBjYWxsYmFjayA9IChtYXRjaCwgYjAsIGIxLCBiMikgLT5cbiAgICAgICAgaWYgRVNDIGlzbnQgYjAgdGhlbiByZXR1cm4gbWF0Y2hcbiAgICAgICAgaWYgKCcnIGlzIGIyKSBvciAobnVsbCBpcyBiMikgdGhlbiBiMiA9ICcwJ1xuICAgICAgICByZXMgPSAnJ1xuICAgICAgICBmb3IgaSBpbiBbMi4uKGFyZ3VtZW50cy5sZW5ndGggLSAzKV0gI2V4Y2x1ZGUgJ29mZnNldCcgYW5kICdzdHJpbmcnIGFyZ3VtZW50c1xuICAgICAgICAgICAgY29kZSA9IHBhcnNlSW50KGFyZ3VtZW50c1tpXSkudG9TdHJpbmcoKVxuICAgICAgICAgICAgaWYgY29kZSBpbiBPYmplY3Qua2V5cyBzdHlsZVNldHNcbiAgICAgICAgICAgICAgICBzdGFjayArPSAnPC9zcGFuPidcbiAgICAgICAgICAgICAgICByZXMgKz0gJzxzcGFuIHN0eWxlPVwiJyArIGdldFN0eWxlVmFsdWUoc3R5bGVTZXRzW2NvZGVdKSArICdcIj4nXG4gICAgICAgIHJldHVybiByZXNcblxuICAgIHJldHVybiAobGluZS5yZXBsYWNlIGFuc2ksIGNhbGxiYWNrKSArIHN0YWNrXG5cbiMgZGV0ZWN0IGFuZCBwcm9jZXNzIHRyYXZpcyBjb250cm9sIGNvZGVcbmZvcm1hdExpbmVzID0gKGxpbmVzKSAtPlxuICAgIGlmIHR5cGVvZiBsaW5lcyBpcyAnc3RyaW5nJyB0aGVuIGxpbmVzID0gbGluZXMuc3BsaXQgJ1xcbidcbiAgICBodG1sID0gJydcbiAgICBFU0MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlIDI3XG4gICAgQ1IgPSBTdHJpbmcuZnJvbUNoYXJDb2RlIDEzXG4gICAgZm9yIGxpbmUsIGluZGV4IGluIGxpbmVzXG4gICAgICAgIGF0dHIgPSAnJ1xuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlIC90cmF2aXNfKGZvbGR8dGltZSk6KHN0YXJ0fGVuZCk6KC4rKS9nLCAobWF0Y2gsIHAxLCBwMiwgcDMpIC0+XG4gICAgICAgICAgICBpZiBwMT8gYW5kIHAyP1xuICAgICAgICAgICAgICAgIGF0dHIgKz0gXCIgZGF0YS0je3AxfS0je3AyfT1cXFwiI3twM31cXFwiXCJcbiAgICAgICAgICAgIHJldHVybiAnJ1xuXG4gICAgICAgIGxpbmUgPSBhbnNpMkh0bWwgbGluZSwgc3R5bGVTZXRzXG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UgbmV3IFJlZ0V4cChDUiwnZycpLCAnJ1xuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlIG5ldyBSZWdFeHAoRVNDLCdnJyksICcnXG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UgL1xcW1xcZD9bS0ddL2csICcnICMgbWF5YmUgdGhpcyBlcmFzZXMgbm9uLWVzY2FwZWQgbGluZVxuXG4gICAgICAgIGh0bWwgKz0gXCI8cCN7YXR0cn0+PGE+I3tpbmRleCArIDF9PC9hPiN7bGluZX08L3A+XCJcblxuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcInRyYXZpcy1sb2ctYm9keVxcXCI+PGRpdiBjbGFzcz1cXFwidHJhdmlzLXByZVxcXCI+I3todG1sfTwvZGl2PjwvZGl2PlwiXG5cblxuIyBkZWZpbmUgdGVybWluYWwgY29kZSBzdHlsZXNcbnN0eWxlU2V0cyA9XG4gICAgMDogIHsgJ2ZvbnQtd2VpZ2h0JzogJ25vcm1hbCcsICdmb250LXN0eWxlJzogJ25vcm1hbCcsICd0ZXh0LWRlY29yYXRpb24nOiAnbm9uZScsJ2JhY2tncm91bmQtY29sb3InOiAnIzIyMicsIGNvbG9yOiAnI2YxZjFmMScgfVxuICAgIDE6ICB7ICdmb250LXdlaWdodCc6ICdib2xkJyB9XG4gICAgMzogIHsgJ2ZvbnQtc3R5bGUnOiAnaXRhbGljJyB9XG4gICAgNDogIHsgJ3RleHQtZGVjb3JhdGlvbic6ICd1bmRlcmxpbmUnIH1cbiAgICA1OiAgeyAnYW5pbWF0aW9uJzogJ2JsaW5rIDFzIHN0ZXAtZW5kIGluZmluaXRlJywgJy13ZWJraXQtYW5pbWF0aW9uJzogJ2JsaW5rIDFzIHN0ZXAtZW5kIGluZmluaXRlJyB9XG4gICAgNzogIHsgaW52ZXJ0OiB0cnVlIH1cbiAgICA5OiAgeyAndGV4dC1kZWNvcmF0aW9uJzogJ2xpbmUtdGhyb3VnaCcgfVxuICAgIDIzOiB7ICdmb250LXN0eWxlJzogJ25vcm1hbCcgfVxuICAgIDI0OiB7ICd0ZXh0LWRlY29yYXRpb24nOiAnbm9uZScgfVxuICAgIDI1OiB7ICdhbmltYXRpb24nOiAnbm9uZScsICctd2Via2l0LWFuaW1hdGlvbic6ICdub25lJyB9XG4gICAgMjc6IHsgaW52ZXJ0OiBmYWxzZSB9XG4gICAgMjk6IHsgJ3RleHQtZGVjb3JhdGlvbic6ICdub25lJyB9XG4gICAgMzA6IHsgY29sb3I6ICcjNEU0RTRFJyB9ICMgYmxhY2tcbiAgICAzMTogeyBjb2xvcjogJyNGRjlCOTMnIH0gIyByZWRcbiAgICAzMjogeyBjb2xvcjogJyNCMUZENzknIH0gIyBncmVlblxuICAgIDMzOiB7IGNvbG9yOiAnI0ZGRkZCNicgfSAjIHllbGxvd1xuICAgIDM0OiB7IGNvbG9yOiAnI0I1RENGRScgfSAjIGJsdWVcbiAgICAzNTogeyBjb2xvcjogJyNGRjczRkQnIH0gIyBtYWdlbXRhXG4gICAgMzY6IHsgY29sb3I6ICcjRTBGRkZGJyB9ICMgY3lhblxuICAgIDM3OiB7IGNvbG9yOiAnI2YxZjFmMScgfSAjIHdoaXRlXG4gICAgMzk6IHsgY29sb3I6ICcjZjFmMWYxJyB9ICNkZWZhdWx0XG4gICAgNDA6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnIzRFNEU0RScgfSAjIGJsYWNrXG4gICAgNDE6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI0ZGOUI5MycgfSAjIHJlZFxuICAgIDQyOiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNCMUZENzknIH0gIyBncmVlblxuICAgIDQzOiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGRkZGQjYnIH0gIyB5ZWxsb3dcbiAgICA0NDogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjQjVEQ0ZFJyB9ICMgYmx1ZVxuICAgIDQ1OiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGRjczRkQnIH0gIyBtYWdlbXRhXG4gICAgNDY6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI0UwRkZGRicgfSAjIGN5YW5cbiAgICA0NzogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjZjFmMWYxJyB9ICMgd2hpdGVcbiAgICA0OTogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjMjIyJyB9ICMgZGVmYXVsdFxuXG5cbmlmIHdpbmRvdz8gdGhlbiAkID0galF1ZXJ5XG5cblxuYWRkRm9sZExhYmVsID0gKCRjb250YWluZXIsIHNlbGVjdG9yKSAtPlxuICAgICRjb250YWluZXIuZmluZChzZWxlY3RvcikuZWFjaCAtPlxuICAgICAgICAkKHRoaXMpLnByZXBlbmQgJCAnPHNwYW4gY2xhc3M9XCJ0cmF2aXMtaW5mbyB0cmF2aXMtZm9sZC1zdGFydFwiPicgKyAoJCh0aGlzKS5kYXRhICdmb2xkLXN0YXJ0JykgKyAnPC9zcGFuPidcblxuXG5hZGRUaW1lTGFiZWwgPSAoJGNvbnRhaW5lciwgc2VsZWN0b3IpIC0+XG4gICAgJGNvbnRhaW5lci5maW5kKHNlbGVjdG9yKS5lYWNoIC0+XG4gICAgICAgICRuID0gJCh0aGlzKVxuICAgICAgICB1bnRpbCAoJG4uZGF0YSAndGltZS1lbmQnKSBvciAoJG4ubGVuZ3RoIGlzIDApXG4gICAgICAgICAgICAkbiA9ICRuLm5leHQoKVxuICAgICAgICBpZiAkbi5kYXRhKCd0aW1lLWVuZCcpXG4gICAgICAgICAgICBkdXJhdGlvbiA9IHV0aWwubnNlYzJzZWMgKCcnKSArICRuLmRhdGEoJ3RpbWUtZW5kJykubWF0Y2goL2R1cmF0aW9uPShcXGQqKSQvKVsxXVxuICAgICAgICAgICAgaWYgZHVyYXRpb24gdGhlbiAkKHRoaXMpLnByZXBlbmQgJCBcIjxzcGFuIGNsYXNzPVxcXCJ0cmF2aXMtaW5mbyB0cmF2aXMtdGltZS1zdGFydFxcXCI+I3tkdXJhdGlvbn1zPC9zcGFuPlwiXG5cblxudG9nZ2xlID0gKCRoYW5kbGUsIGJvb2wpIC0+XG4gICAgW29wZW5lZCwgY2xvc2VkXSA9IFsndHJhdmlzLWZvbGQtY2xvc2UnLCAndHJhdmlzLWZvbGQtb3BlbiddXG4gICAgJGhhbmRsZS5yZW1vdmVDbGFzcyhpZiBib29sIHRoZW4gY2xvc2VkIGVsc2Ugb3BlbmVkKVxuICAgICRoYW5kbGUuYWRkQ2xhc3MoaWYgYm9vbCB0aGVuIG9wZW5lZCBlbHNlIGNsb3NlZClcbiAgICAkbiA9ICRoYW5kbGUubmV4dCgpXG4gICAgbGFiZWwgPSAkaGFuZGxlLmRhdGEgJ2ZvbGQtc3RhcnQnXG4gICAgdW50aWwgKGxhYmVsIGlzICRuLmRhdGEgJ2ZvbGQtZW5kJykgb3IgKCRuLmRhdGEgJ2ZvbGQtc3RhcnQnKT8gb3IgKCRuLmxlbmd0aCBpcyAwKVxuICAgICAgICAkbltpZiBib29sIHRoZW4gJ3Nob3cnIGVsc2UgJ2hpZGUnXSgpXG4gICAgICAgICRuID0gJG4ubmV4dCgpXG5cblxuYWRkRm9sZEhhbmRsZXJzID0gKCRjb250YWluZXIsIHNlbGVjdG9yKSAtPlxuICAgIFtvcGVuZWQsIGNsb3NlZF0gPSBbJ3RyYXZpcy1mb2xkLWNsb3NlJywgJ3RyYXZpcy1mb2xkLW9wZW4nXVxuICAgICRjb250YWluZXIuZmluZChzZWxlY3RvcilcbiAgICAgICAgLmFkZENsYXNzIGNsb3NlZFxuICAgICAgICAuZWFjaCAtPlxuICAgICAgICAgICAgdG9nZ2xlKCQodGhpcykucGFyZW50KCksIGZhbHNlKVxuICAgICAgICAgICAgJCh0aGlzKS5jbGljayAtPlxuICAgICAgICAgICAgICAgICAgICAkcCA9ICQodGhpcykucGFyZW50KClcbiAgICAgICAgICAgICAgICAgICAgaWYgJHAuaGFzQ2xhc3Mgb3BlbmVkIHRoZW4gdG9nZ2xlKCRwLCBmYWxzZSkgZWxzZSB0b2dnbGUoJHAsIHRydWUpXG5cblxuYWN0aXZhdGVMaW5lID0gKCRjb250YWluZXIsIHNlbGVjdG9yLCBsaW5lKSAtPlxuICAgICRwcmUgPSAkY29udGFpbmVyLmZpbmQoXCIje3NlbGVjdG9yfSAudHJhdmlzLXByZVwiKVxuICAgICRwICAgPSAkY29udGFpbmVyLmZpbmQoXCIje3NlbGVjdG9yfSBwXCIpLmVxKGxpbmUgLSAxKVxuICAgIGlmICRwLmxlbmd0aCBpcyAwIHRoZW4gcmV0dXJuXG4gICAgJHAuYWRkQ2xhc3MgJ3RyYXZpcy1naXZlbi1hY3RpdmUtbGluZSdcbiAgICBpZiAkcC5jc3MoJ2Rpc3BsYXknKSBpcyAnbm9uZSdcbiAgICAgICAgJHBvaW50ZXIgPSAkcFxuICAgICAgICB1bnRpbCAoJHBvaW50ZXIuZGF0YSAnZm9sZC1zdGFydCcpIG9yICgkcG9pbnRlci5sZW5ndGggaXMgMClcbiAgICAgICAgICAgICRwb2ludGVyID0gJHBvaW50ZXIucHJldigpXG4gICAgICAgIHRvZ2dsZSgkcG9pbnRlciwgdHJ1ZSlcbiAgICBib2R5SGVpZ2h0ID0gJHByZS5oZWlnaHQoKVxuICAgIGxpbmVUb3AgICAgPSAkcC5wb3NpdGlvbigpLnRvcCAtICRwcmUucG9zaXRpb24oKS50b3BcbiAgICBsaW5lSGVpZ2h0ID0gJHAuaGVpZ2h0KClcbiAgICBkID0gbGluZVRvcCAtIChib2R5SGVpZ2h0IC8gMikgKyAobGluZUhlaWdodCAvIDIpXG4gICAgJHByZS5zY3JvbGxUb3AgZFxuXG5cbmFkZEZvb3RlciA9ICgkY29udGFpbmVyLCBzZWxlY3RvciwgYXJnKSAtPlxuICAgIHthdXRob3IsIHJlcG8sIGxpbmUsIHVybH0gPSBhcmdcbiAgICBpZiBhdXRob3IgYW5kIHJlcG9cbiAgICAgICAgY29udGVudCA9IFwiI3thdXRob3J9LyN7cmVwb31cIlxuICAgICAgICAjIG5lZWQgdG8gaW5qZWN0IGJyYW5jaCBpbmZvcm1hdGlvbiB0byBzaG93IGJhZGdlXG4gICAgICAgICMgYmFkZ2UgPSBcIjxpbWcgY2xhc3M9XFxcInRyYXZpcy1iYWRnZVxcXCIgc3JjPVxcXCJodHRwczovL2FwaS50cmF2aXMtY2kub3JnLyN7YXV0aG9yfS8je3JlcG99LnN2Zz9icmFuY2g9I3ticmFuY2h9XFxcIiBhbHQ9XFxcInN0YXRlXFxcIiAvPlwiXG4gICAgZWxzZVxuICAgICAgICBjb250ZW50ID0gJ1RoaXMgcmVwb3NpdG9yeSdcbiAgICAgICAgYmFkZ2UgPSAnJ1xuICAgICMgY2hlY2sgaWYgbGluZSBpcyB2YWxpZChub3QgYmUgb3ZlciBhbGwgbGluZSBsZW5ndGgpXG4gICAgaWYgbGluZSBhbmQgJGNvbnRhaW5lci5maW5kKFwiI3tzZWxlY3Rvcn0gcFwiKS5lcShsaW5lIC0gMSkubGVuZ3RoID4gMFxuICAgICAgICBjb250ZW50ID0gXCIje2NvbnRlbnR9I0wje2xpbmV9XCJcbiAgICBpZiB1cmxcbiAgICAgICAgY29udGVudCA9IFwiPGEgaHJlZj1cXFwiI3t1cmx9XFxcIj4je2NvbnRlbnR9PC9hPlwiXG4gICAgJGNvbnRhaW5lci5hcHBlbmQgJCBcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPVxcXCJ0cmF2aXMtbG9nLWZvb3RlclxcXCI+PGgyIGNsYXNzPVwidHJhdmlzLWZvb3Rlci10ZXh0XCI+XG4gICAgICAgICN7Y29udGVudH0gYnVpbHQgd2l0aCA8YSBocmVmPVxcXCJodHRwczovL3RyYXZpcy1jaS5vcmdcXFwiPlRyYXZpcyBDSTwvYT4uXG4gICAgPC9oMj48L2Rpdj5cbiAgICBcIlwiXCJcblxuXG4jIG1haW4gbW9kdWxlXG5tYWluID0gLT5cbiAgICAkKCcub2VtYmVkLXRyYXZpcycpLmVhY2ggLT5cbiAgICAgICAgJGNvbnRhaW5lciA9ICQgdGhpc1xuICAgICAgICBpZiAkY29udGFpbmVyLmNoaWxkcmVuID4gMCB0aGVuIHJldHVyblxuICAgICAgICB1cmwgICAgPSAkY29udGFpbmVyLmRhdGEgJ3VybCdcbiAgICAgICAgYXV0aG9yID0gJGNvbnRhaW5lci5kYXRhICdhdXRob3InXG4gICAgICAgIHJlcG8gICA9ICRjb250YWluZXIuZGF0YSAncmVwbydcbiAgICAgICAgdHlwZSAgID0gaWYgJGNvbnRhaW5lci5kYXRhICdidWlsZHMnIHRoZW4gJ2J1aWxkcycgZWxzZSAnam9icydcbiAgICAgICAgaWQgICAgID0gJGNvbnRhaW5lci5kYXRhIHR5cGVcbiAgICAgICAgbGluZSAgID0gJGNvbnRhaW5lci5kYXRhICdsaW5lJ1xuXG4gICAgICAgIGlmIHR5cGUgaXMgJ2J1aWxkcydcbiAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zID1cbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9hcGkudHJhdmlzLWNpLm9yZy9idWlsZHMvI3tpZH1cIlxuICAgICAgICAgICAgICAgIGhlYWRlcnM6XG4gICAgICAgICAgICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL3ZuZC50cmF2aXMtY2kuMitqc29uJ1xuXG4gICAgICAgICAgICAkLmFqYXggcmVxdWVzdE9wdGlvbnNcbiAgICAgICAgICAgICAgICAudGhlbiAoe2pvYnN9KSAtPlxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2FyY2hpdmUudHJhdmlzLWNpLm9yZy9qb2JzLyN7am9ic1swXS5pZH0vbG9nLnR4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjY2VwdDogJ3RleHQvcGxhaW4nXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA1MDAwXG5cbiAgICAgICAgICAgICAgICAgICAgJC5hamF4IHJlcXVlc3RPcHRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiAobGluZXMpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5hcHBlbmQgJCBmb3JtYXRMaW5lcyhsaW5lcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRGb2xkTGFiZWwgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHkgcFtkYXRhLWZvbGQtc3RhcnRdJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZFRpbWVMYWJlbCAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keSBwW2RhdGEtdGltZS1zdGFydF0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRm9sZEhhbmRsZXJzICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5IHBbZGF0YS1mb2xkLXN0YXJ0XT5hJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxpbmUgdGhlbiBhY3RpdmF0ZUxpbmUgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHknLCBsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRm9vdGVyICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5Jywge2F1dGhvciwgcmVwbywgbGluZSwgdXJsfVxuXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMgPVxuICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vYXJjaGl2ZS50cmF2aXMtY2kub3JnL2pvYnMvI3tpZH0vbG9nLnR4dFwiXG4gICAgICAgICAgICAgICAgaGVhZGVyczpcbiAgICAgICAgICAgICAgICAgICAgQWNjZXB0OiAndGV4dC9wbGFpbidcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiA1MDAwXG5cblxuICAgICAgICAgICAgJC5hamF4IHJlcXVlc3RPcHRpb25zXG4gICAgICAgICAgICAgICAgLnRoZW4gKGxpbmVzKSAtPlxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmFwcGVuZCAkIGZvcm1hdExpbmVzKGxpbmVzKVxuICAgICAgICAgICAgICAgICAgICBhZGRGb2xkTGFiZWwgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHkgcFtkYXRhLWZvbGQtc3RhcnRdJ1xuICAgICAgICAgICAgICAgICAgICBhZGRUaW1lTGFiZWwgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHkgcFtkYXRhLXRpbWUtc3RhcnRdJ1xuICAgICAgICAgICAgICAgICAgICBhZGRGb2xkSGFuZGxlcnMgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHkgcFtkYXRhLWZvbGQtc3RhcnRdPmEnXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmUgdGhlbiBhY3RpdmF0ZUxpbmUgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHknLCBsaW5lXG4gICAgICAgICAgICAgICAgICAgIGFkZEZvb3RlciAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keScsIHthdXRob3IsIHJlcG8sIGxpbmUsIHVybH1cblxuXG5cblxuIyBlbmdpbmUgaGFuZGxpbmdcbmlmIG1vZHVsZT9cbiAgICAjIGV4cG9ydCBmb3IgdGVzdFxuICAgIG1vZHVsZS5leHBvcnRzID0geyB1dGlsLCBhbnNpMkh0bWwsIGZvcm1hdExpbmVzIH1cbmVsc2UgaWYgd2luZG93P1xuICAgICMgZXhlYyBvbiBicm93c2VyXG4gICAgJChkb2N1bWVudCkucmVhZHkgbWFpblxuIl19
