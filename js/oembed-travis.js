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
    var CR, ESC, LF, attr, html, index, j, len, line;
    ESC = String.fromCharCode(27);
    CR = String.fromCharCode(13);
    LF = String.fromCharCode(10);
    lines = lines.replace('[0G' + CR + LF, '');
    lines = lines.split(LF);
    html = '';
    for (index = j = 0, len = lines.length; j < len; index = ++j) {
      line = lines[index];
      console.log((index + 1) + ": " + (escape(line)));
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
    return $container.append($("<div class=\"travis-log-footer\"><div class=\"travis-footer-text\">\n    " + content + " built with <a href=\"https://travis-ci.org\">Travis CI</a>.\n</div></div>"));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzL29lbWJlZC10cmF2aXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSw4SEFBQTtJQUFBOztFQUFBLElBQUEsR0FDSTtJQUFBLFFBQUEsRUFBVSxTQUFDLElBQUQ7YUFBVSxJQUFJLENBQUMsS0FBTCxDQUFZLElBQUEsR0FBTyxRQUFuQixDQUFBLEdBQStCO0lBQXpDLENBQVY7OztFQUdKLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxTQUFQO0FBQ1IsUUFBQTtJQUFBLElBQUEsR0FBTztJQUNQLEdBQUEsR0FBTSxNQUFNLENBQUMsWUFBUCxDQUFvQixJQUFwQjtJQUNOLEtBQUEsR0FBUTtJQUVSLGFBQUEsR0FBZ0IsU0FBQyxRQUFEO0FBQ1osVUFBQTtNQUFBLElBQU8sZ0JBQVA7QUFBc0IsZUFBTyxHQUE3Qjs7TUFDQSxPQUFBLEdBQVU7QUFDVixXQUFBLGVBQUE7O1FBQ0ksSUFBRyxhQUFIO1VBQWUsT0FBTyxDQUFDLElBQVIsQ0FBZ0IsR0FBRCxHQUFLLEdBQUwsR0FBUSxLQUF2QixFQUFmOztBQURKO0FBRUEsYUFBTyxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWI7SUFMSztJQU9oQixRQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsRUFBUixFQUFZLEVBQVosRUFBZ0IsRUFBaEI7QUFDUCxVQUFBO01BQUEsSUFBRyxHQUFBLEtBQVMsRUFBWjtBQUFvQixlQUFPLE1BQTNCOztNQUNBLElBQUcsQ0FBQyxFQUFBLEtBQU0sRUFBUCxDQUFBLElBQWMsQ0FBQyxJQUFBLEtBQVEsRUFBVCxDQUFqQjtRQUFtQyxFQUFBLEdBQUssSUFBeEM7O01BQ0EsR0FBQSxHQUFNO0FBQ04sV0FBUywrRkFBVDtRQUNJLElBQUEsR0FBTyxRQUFBLENBQVMsU0FBVSxDQUFBLENBQUEsQ0FBbkIsQ0FBc0IsQ0FBQyxRQUF2QixDQUFBO1FBQ1AsSUFBRyxhQUFRLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBWixDQUFSLEVBQUEsSUFBQSxNQUFI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O1VBQ0EsT0FBQSxFQUNJO1lBQUEsTUFBQSxFQUFRLFlBQVI7V0FGSjtVQUdBLE9BQUEsRUFBUyxJQUhUOztlQU1KLENBQUMsQ0FBQyxJQUFGLENBQU8sY0FBUCxDQUNJLENBQUMsSUFETCxDQUNVLFNBQUMsS0FBRDtVQUNGLFVBQVUsQ0FBQyxNQUFYLENBQWtCLENBQUEsQ0FBRSxXQUFBLENBQVksS0FBWixDQUFGLENBQWxCO1VBQ0EsWUFBQSxDQUFhLFVBQWIsRUFBeUIscUNBQXpCO1VBQ0EsWUFBQSxDQUFhLFVBQWIsRUFBeUIscUNBQXpCO1VBQ0EsZUFBQSxDQUFnQixVQUFoQixFQUE0Qix1Q0FBNUI7VUFDQSxJQUFHLElBQUg7WUFBYSxZQUFBLENBQWEsVUFBYixFQUF5QixrQkFBekIsRUFBNkMsSUFBN0MsRUFBYjs7aUJBQ0EsU0FBQSxDQUFVLFVBQVYsRUFBc0Isa0JBQXRCLEVBQTBDO1lBQUMsUUFBQSxNQUFEO1lBQVMsTUFBQSxJQUFUO1lBQWUsTUFBQSxJQUFmO1lBQXFCLEtBQUEsR0FBckI7V0FBMUM7UUFORSxDQURWLEVBaENKOztJQVZxQixDQUF6QjtFQURHOztFQXdEUCxJQUFHLGdEQUFIO0lBRUksTUFBTSxDQUFDLE9BQVAsR0FBaUI7TUFBRSxNQUFBLElBQUY7TUFBUSxXQUFBLFNBQVI7TUFBbUIsYUFBQSxXQUFuQjtNQUZyQjtHQUFBLE1BR0ssSUFBRyxnREFBSDtJQUVELENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxLQUFaLENBQWtCLElBQWxCLEVBRkM7O0FBcE9MIiwiZmlsZSI6ImpzL29lbWJlZC10cmF2aXMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIHNvbWUgdXRpbGl0aWVzXG51dGlsID1cbiAgICBuc2VjMnNlYzogKG5zZWMpIC0+IE1hdGgucm91bmQoIG5zZWMgLyAxMDAwMDAwMCkgLyAxMDBcblxuIyB0ZXJtaW5hbCBjb2RlcyB0byBIdG1sXG5hbnNpMkh0bWwgPSAobGluZSwgc3R5bGVTZXRzKSAtPlxuICAgIGFuc2kgPSAvKC4pXFxbKFxcZCs7KT8oXFxkKykqbS9nXG4gICAgRVNDID0gU3RyaW5nLmZyb21DaGFyQ29kZSAnMjcnXG4gICAgc3RhY2sgPSAnJ1xuXG4gICAgZ2V0U3R5bGVWYWx1ZSA9IChzdHlsZVNldCkgLT5cbiAgICAgICAgdW5sZXNzIHN0eWxlU2V0PyB0aGVuIHJldHVybiAnJ1xuICAgICAgICByZXN1bHRzID0gW11cbiAgICAgICAgZm9yIGtleSwgdmFsdWUgb2Ygc3R5bGVTZXRcbiAgICAgICAgICAgIGlmIHZhbHVlPyB0aGVuIHJlc3VsdHMucHVzaCBcIiN7a2V5fToje3ZhbHVlfVwiXG4gICAgICAgIHJldHVybiByZXN1bHRzLmpvaW4gJzsnXG5cbiAgICBjYWxsYmFjayA9IChtYXRjaCwgYjAsIGIxLCBiMikgLT5cbiAgICAgICAgaWYgRVNDIGlzbnQgYjAgdGhlbiByZXR1cm4gbWF0Y2hcbiAgICAgICAgaWYgKCcnIGlzIGIyKSBvciAobnVsbCBpcyBiMikgdGhlbiBiMiA9ICcwJ1xuICAgICAgICByZXMgPSAnJ1xuICAgICAgICBmb3IgaSBpbiBbMi4uKGFyZ3VtZW50cy5sZW5ndGggLSAzKV0gI2V4Y2x1ZGUgJ29mZnNldCcgYW5kICdzdHJpbmcnIGFyZ3VtZW50c1xuICAgICAgICAgICAgY29kZSA9IHBhcnNlSW50KGFyZ3VtZW50c1tpXSkudG9TdHJpbmcoKVxuICAgICAgICAgICAgaWYgY29kZSBpbiBPYmplY3Qua2V5cyBzdHlsZVNldHNcbiAgICAgICAgICAgICAgICBzdGFjayArPSAnPC9zcGFuPidcbiAgICAgICAgICAgICAgICByZXMgKz0gJzxzcGFuIHN0eWxlPVwiJyArIGdldFN0eWxlVmFsdWUoc3R5bGVTZXRzW2NvZGVdKSArICdcIj4nXG4gICAgICAgIHJldHVybiByZXNcblxuICAgIHJldHVybiAobGluZS5yZXBsYWNlIGFuc2ksIGNhbGxiYWNrKSArIHN0YWNrXG5cbiMgZGV0ZWN0IGFuZCBwcm9jZXNzIHRyYXZpcyBjb250cm9sIGNvZGVcbmZvcm1hdExpbmVzID0gKGxpbmVzKSAtPlxuICAgIEVTQyA9IFN0cmluZy5mcm9tQ2hhckNvZGUgMjdcbiAgICBDUiA9IFN0cmluZy5mcm9tQ2hhckNvZGUgMTNcbiAgICBMRiA9IFN0cmluZy5mcm9tQ2hhckNvZGUgMTBcbiAgICBsaW5lcyA9IGxpbmVzLnJlcGxhY2UgJ1swRycgKyBDUiArIExGLCAnJ1xuICAgIGxpbmVzID0gbGluZXMuc3BsaXQgTEZcblxuICAgIGh0bWwgPSAnJ1xuICAgIGZvciBsaW5lLCBpbmRleCBpbiBsaW5lc1xuICAgICAgICBjb25zb2xlLmxvZyBcIiN7aW5kZXggKyAxfTogI3tlc2NhcGUgbGluZX1cIlxuICAgICAgICAjIGNvbnNvbGUubG9nIC9eJTFCJTVCMG0oJTFCJTVCMEcoWy0vXXwlWzc1XUMpKSslMUIlNUIwRyUwRCQvLnRlc3QgZXNjYXBlIGxpbmVcbiAgICAgICAgYXR0ciA9ICcnXG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UgL3RyYXZpc18oZm9sZHx0aW1lKTooc3RhcnR8ZW5kKTooLispL2csIChtYXRjaCwgcDEsIHAyLCBwMykgLT5cbiAgICAgICAgICAgIGlmIHAxPyBhbmQgcDI/XG4gICAgICAgICAgICAgICAgYXR0ciArPSBcIiBkYXRhLSN7cDF9LSN7cDJ9PVxcXCIje3AzfVxcXCJcIlxuICAgICAgICAgICAgcmV0dXJuICcnXG4gICAgICAgIGxpbmUgPSBhbnNpMkh0bWwobGluZSwgc3R5bGVTZXRzKVxuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlIG5ldyBSZWdFeHAoQ1IsJ2cnKSwgJydcbiAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSBuZXcgUmVnRXhwKEVTQywnZycpLCAnJ1xuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlIC9cXFtcXGQ/W0tHXS9nLCAnJyAjIG1heWJlIHRoaXMgZXJhc2VzIG5vbi1lc2NhcGVkIGxpbmVcblxuICAgICAgICBodG1sICs9IFwiPHAje2F0dHJ9PjxhPiN7aW5kZXggKyAxfTwvYT4je2xpbmV9PC9wPlwiXG5cbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJ0cmF2aXMtbG9nLWJvZHlcXFwiPjxkaXYgY2xhc3M9XFxcInRyYXZpcy1wcmVcXFwiPiN7aHRtbH08L2Rpdj48L2Rpdj5cIlxuXG5cbiMgZGVmaW5lIHRlcm1pbmFsIGNvZGUgc3R5bGVzXG5zdHlsZVNldHMgPVxuICAgIDA6ICB7ICdmb250LXdlaWdodCc6ICdub3JtYWwnLCAnZm9udC1zdHlsZSc6ICdub3JtYWwnLCAndGV4dC1kZWNvcmF0aW9uJzogJ25vbmUnLCdiYWNrZ3JvdW5kLWNvbG9yJzogJyMyMjInLCBjb2xvcjogJyNmMWYxZjEnIH1cbiAgICAxOiAgeyAnZm9udC13ZWlnaHQnOiAnYm9sZCcgfVxuICAgIDM6ICB7ICdmb250LXN0eWxlJzogJ2l0YWxpYycgfVxuICAgIDQ6ICB7ICd0ZXh0LWRlY29yYXRpb24nOiAndW5kZXJsaW5lJyB9XG4gICAgNTogIHsgJ2FuaW1hdGlvbic6ICdibGluayAxcyBzdGVwLWVuZCBpbmZpbml0ZScsICctd2Via2l0LWFuaW1hdGlvbic6ICdibGluayAxcyBzdGVwLWVuZCBpbmZpbml0ZScgfVxuICAgIDc6ICB7IGludmVydDogdHJ1ZSB9XG4gICAgOTogIHsgJ3RleHQtZGVjb3JhdGlvbic6ICdsaW5lLXRocm91Z2gnIH1cbiAgICAyMzogeyAnZm9udC1zdHlsZSc6ICdub3JtYWwnIH1cbiAgICAyNDogeyAndGV4dC1kZWNvcmF0aW9uJzogJ25vbmUnIH1cbiAgICAyNTogeyAnYW5pbWF0aW9uJzogJ25vbmUnLCAnLXdlYmtpdC1hbmltYXRpb24nOiAnbm9uZScgfVxuICAgIDI3OiB7IGludmVydDogZmFsc2UgfVxuICAgIDI5OiB7ICd0ZXh0LWRlY29yYXRpb24nOiAnbm9uZScgfVxuICAgIDMwOiB7IGNvbG9yOiAnIzRFNEU0RScgfSAjIGJsYWNrXG4gICAgMzE6IHsgY29sb3I6ICcjRkY5QjkzJyB9ICMgcmVkXG4gICAgMzI6IHsgY29sb3I6ICcjQjFGRDc5JyB9ICMgZ3JlZW5cbiAgICAzMzogeyBjb2xvcjogJyNGRkZGQjYnIH0gIyB5ZWxsb3dcbiAgICAzNDogeyBjb2xvcjogJyNCNURDRkUnIH0gIyBibHVlXG4gICAgMzU6IHsgY29sb3I6ICcjRkY3M0ZEJyB9ICMgbWFnZW10YVxuICAgIDM2OiB7IGNvbG9yOiAnI0UwRkZGRicgfSAjIGN5YW5cbiAgICAzNzogeyBjb2xvcjogJyNmMWYxZjEnIH0gIyB3aGl0ZVxuICAgIDM5OiB7IGNvbG9yOiAnI2YxZjFmMScgfSAjZGVmYXVsdFxuICAgIDQwOiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyM0RTRFNEUnIH0gIyBibGFja1xuICAgIDQxOiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGRjlCOTMnIH0gIyByZWRcbiAgICA0MjogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjQjFGRDc5JyB9ICMgZ3JlZW5cbiAgICA0MzogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjRkZGRkI2JyB9ICMgeWVsbG93XG4gICAgNDQ6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI0I1RENGRScgfSAjIGJsdWVcbiAgICA0NTogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjRkY3M0ZEJyB9ICMgbWFnZW10YVxuICAgIDQ2OiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNFMEZGRkYnIH0gIyBjeWFuXG4gICAgNDc6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI2YxZjFmMScgfSAjIHdoaXRlXG4gICAgNDk6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnIzIyMicgfSAjIGRlZmF1bHRcblxuXG5pZiB3aW5kb3c/IHRoZW4gJCA9IGpRdWVyeVxuXG5cbmFkZEZvbGRMYWJlbCA9ICgkY29udGFpbmVyLCBzZWxlY3RvcikgLT5cbiAgICAkY29udGFpbmVyLmZpbmQoc2VsZWN0b3IpLmVhY2ggLT5cbiAgICAgICAgJCh0aGlzKS5wcmVwZW5kICQgJzxzcGFuIGNsYXNzPVwidHJhdmlzLWluZm8gdHJhdmlzLWZvbGQtc3RhcnRcIj4nICsgKCQodGhpcykuZGF0YSAnZm9sZC1zdGFydCcpICsgJzwvc3Bhbj4nXG5cblxuYWRkVGltZUxhYmVsID0gKCRjb250YWluZXIsIHNlbGVjdG9yKSAtPlxuICAgICRjb250YWluZXIuZmluZChzZWxlY3RvcikuZWFjaCAtPlxuICAgICAgICAkbiA9ICQodGhpcylcbiAgICAgICAgdW50aWwgKCRuLmRhdGEgJ3RpbWUtZW5kJykgb3IgKCRuLmxlbmd0aCBpcyAwKVxuICAgICAgICAgICAgJG4gPSAkbi5uZXh0KClcbiAgICAgICAgaWYgJG4uZGF0YSgndGltZS1lbmQnKVxuICAgICAgICAgICAgZHVyYXRpb24gPSB1dGlsLm5zZWMyc2VjICgnJykgKyAkbi5kYXRhKCd0aW1lLWVuZCcpLm1hdGNoKC9kdXJhdGlvbj0oXFxkKikkLylbMV1cbiAgICAgICAgICAgIGlmIGR1cmF0aW9uIHRoZW4gJCh0aGlzKS5wcmVwZW5kICQgXCI8c3BhbiBjbGFzcz1cXFwidHJhdmlzLWluZm8gdHJhdmlzLXRpbWUtc3RhcnRcXFwiPiN7ZHVyYXRpb259czwvc3Bhbj5cIlxuXG5cbnRvZ2dsZSA9ICgkaGFuZGxlLCBib29sKSAtPlxuICAgIFtvcGVuZWQsIGNsb3NlZF0gPSBbJ3RyYXZpcy1mb2xkLWNsb3NlJywgJ3RyYXZpcy1mb2xkLW9wZW4nXVxuICAgICRoYW5kbGUucmVtb3ZlQ2xhc3MoaWYgYm9vbCB0aGVuIGNsb3NlZCBlbHNlIG9wZW5lZClcbiAgICAkaGFuZGxlLmFkZENsYXNzKGlmIGJvb2wgdGhlbiBvcGVuZWQgZWxzZSBjbG9zZWQpXG4gICAgJG4gPSAkaGFuZGxlLm5leHQoKVxuICAgIGxhYmVsID0gJGhhbmRsZS5kYXRhICdmb2xkLXN0YXJ0J1xuICAgIHVudGlsIChsYWJlbCBpcyAkbi5kYXRhICdmb2xkLWVuZCcpIG9yICgkbi5kYXRhICdmb2xkLXN0YXJ0Jyk/IG9yICgkbi5sZW5ndGggaXMgMClcbiAgICAgICAgJG5baWYgYm9vbCB0aGVuICdzaG93JyBlbHNlICdoaWRlJ10oKVxuICAgICAgICAkbiA9ICRuLm5leHQoKVxuXG5cbmFkZEZvbGRIYW5kbGVycyA9ICgkY29udGFpbmVyLCBzZWxlY3RvcikgLT5cbiAgICBbb3BlbmVkLCBjbG9zZWRdID0gWyd0cmF2aXMtZm9sZC1jbG9zZScsICd0cmF2aXMtZm9sZC1vcGVuJ11cbiAgICAkY29udGFpbmVyLmZpbmQoc2VsZWN0b3IpXG4gICAgICAgIC5hZGRDbGFzcyBjbG9zZWRcbiAgICAgICAgLmVhY2ggLT5cbiAgICAgICAgICAgIHRvZ2dsZSgkKHRoaXMpLnBhcmVudCgpLCBmYWxzZSlcbiAgICAgICAgICAgICQodGhpcykuY2xpY2sgLT5cbiAgICAgICAgICAgICAgICAgICAgJHAgPSAkKHRoaXMpLnBhcmVudCgpXG4gICAgICAgICAgICAgICAgICAgIGlmICRwLmhhc0NsYXNzIG9wZW5lZCB0aGVuIHRvZ2dsZSgkcCwgZmFsc2UpIGVsc2UgdG9nZ2xlKCRwLCB0cnVlKVxuXG5cbmFjdGl2YXRlTGluZSA9ICgkY29udGFpbmVyLCBzZWxlY3RvciwgbGluZSkgLT5cbiAgICAkcHJlID0gJGNvbnRhaW5lci5maW5kKFwiI3tzZWxlY3Rvcn0gLnRyYXZpcy1wcmVcIilcbiAgICAkcCAgID0gJGNvbnRhaW5lci5maW5kKFwiI3tzZWxlY3Rvcn0gcFwiKS5lcShsaW5lIC0gMSlcbiAgICBpZiAkcC5sZW5ndGggaXMgMCB0aGVuIHJldHVyblxuICAgICRwLmFkZENsYXNzICd0cmF2aXMtZ2l2ZW4tYWN0aXZlLWxpbmUnXG4gICAgaWYgJHAuY3NzKCdkaXNwbGF5JykgaXMgJ25vbmUnXG4gICAgICAgICRwb2ludGVyID0gJHBcbiAgICAgICAgdW50aWwgKCRwb2ludGVyLmRhdGEgJ2ZvbGQtc3RhcnQnKSBvciAoJHBvaW50ZXIubGVuZ3RoIGlzIDApXG4gICAgICAgICAgICAkcG9pbnRlciA9ICRwb2ludGVyLnByZXYoKVxuICAgICAgICB0b2dnbGUoJHBvaW50ZXIsIHRydWUpXG4gICAgYm9keUhlaWdodCA9ICRwcmUuaGVpZ2h0KClcbiAgICBsaW5lVG9wICAgID0gJHAucG9zaXRpb24oKS50b3AgLSAkcHJlLnBvc2l0aW9uKCkudG9wXG4gICAgbGluZUhlaWdodCA9ICRwLmhlaWdodCgpXG4gICAgZCA9IGxpbmVUb3AgLSAoYm9keUhlaWdodCAvIDIpICsgKGxpbmVIZWlnaHQgLyAyKVxuICAgICRwcmUuc2Nyb2xsVG9wIGRcblxuXG5hZGRGb290ZXIgPSAoJGNvbnRhaW5lciwgc2VsZWN0b3IsIGFyZykgLT5cbiAgICB7YXV0aG9yLCByZXBvLCBsaW5lLCB1cmx9ID0gYXJnXG4gICAgaWYgYXV0aG9yIGFuZCByZXBvXG4gICAgICAgIGNvbnRlbnQgPSBcIiN7YXV0aG9yfS8je3JlcG99XCJcbiAgICAgICAgIyBuZWVkIHRvIGluamVjdCBicmFuY2ggaW5mb3JtYXRpb24gdG8gc2hvdyBiYWRnZVxuICAgICAgICAjIGJhZGdlID0gXCI8aW1nIGNsYXNzPVxcXCJ0cmF2aXMtYmFkZ2VcXFwiIHNyYz1cXFwiaHR0cHM6Ly9hcGkudHJhdmlzLWNpLm9yZy8je2F1dGhvcn0vI3tyZXBvfS5zdmc/YnJhbmNoPSN7YnJhbmNofVxcXCIgYWx0PVxcXCJzdGF0ZVxcXCIgLz5cIlxuICAgIGVsc2VcbiAgICAgICAgY29udGVudCA9ICdUaGlzIHJlcG9zaXRvcnknXG4gICAgICAgIGJhZGdlID0gJydcbiAgICAjIGNoZWNrIGlmIGxpbmUgaXMgdmFsaWQobm90IGJlIG92ZXIgYWxsIGxpbmUgbGVuZ3RoKVxuICAgIGlmIGxpbmUgYW5kICRjb250YWluZXIuZmluZChcIiN7c2VsZWN0b3J9IHBcIikuZXEobGluZSAtIDEpLmxlbmd0aCA+IDBcbiAgICAgICAgY29udGVudCA9IFwiI3tjb250ZW50fSNMI3tsaW5lfVwiXG4gICAgaWYgdXJsXG4gICAgICAgIGNvbnRlbnQgPSBcIjxhIGhyZWY9XFxcIiN7dXJsfVxcXCI+I3tjb250ZW50fTwvYT5cIlxuICAgICRjb250YWluZXIuYXBwZW5kICQgXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cXFwidHJhdmlzLWxvZy1mb290ZXJcXFwiPjxkaXYgY2xhc3M9XCJ0cmF2aXMtZm9vdGVyLXRleHRcIj5cbiAgICAgICAgI3tjb250ZW50fSBidWlsdCB3aXRoIDxhIGhyZWY9XFxcImh0dHBzOi8vdHJhdmlzLWNpLm9yZ1xcXCI+VHJhdmlzIENJPC9hPi5cbiAgICA8L2Rpdj48L2Rpdj5cbiAgICBcIlwiXCJcblxuXG4jIG1haW4gbW9kdWxlXG5tYWluID0gLT5cbiAgICAkKCcub2VtYmVkLXRyYXZpcycpLmVhY2ggLT5cbiAgICAgICAgJGNvbnRhaW5lciA9ICQgdGhpc1xuICAgICAgICBpZiAkY29udGFpbmVyLmNoaWxkcmVuID4gMCB0aGVuIHJldHVyblxuICAgICAgICB1cmwgICAgPSAkY29udGFpbmVyLmRhdGEgJ3VybCdcbiAgICAgICAgYXV0aG9yID0gJGNvbnRhaW5lci5kYXRhICdhdXRob3InXG4gICAgICAgIHJlcG8gICA9ICRjb250YWluZXIuZGF0YSAncmVwbydcbiAgICAgICAgdHlwZSAgID0gaWYgJGNvbnRhaW5lci5kYXRhICdidWlsZHMnIHRoZW4gJ2J1aWxkcycgZWxzZSAnam9icydcbiAgICAgICAgaWQgICAgID0gJGNvbnRhaW5lci5kYXRhIHR5cGVcbiAgICAgICAgbGluZSAgID0gJGNvbnRhaW5lci5kYXRhICdsaW5lJ1xuXG4gICAgICAgIGlmIHR5cGUgaXMgJ2J1aWxkcydcbiAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zID1cbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9hcGkudHJhdmlzLWNpLm9yZy9idWlsZHMvI3tpZH1cIlxuICAgICAgICAgICAgICAgIGhlYWRlcnM6XG4gICAgICAgICAgICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL3ZuZC50cmF2aXMtY2kuMitqc29uJ1xuXG4gICAgICAgICAgICAkLmFqYXggcmVxdWVzdE9wdGlvbnNcbiAgICAgICAgICAgICAgICAudGhlbiAoe2pvYnN9KSAtPlxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2FyY2hpdmUudHJhdmlzLWNpLm9yZy9qb2JzLyN7am9ic1swXS5pZH0vbG9nLnR4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjY2VwdDogJ3RleHQvcGxhaW4nXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiA1MDAwXG5cbiAgICAgICAgICAgICAgICAgICAgJC5hamF4IHJlcXVlc3RPcHRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiAobGluZXMpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5hcHBlbmQgJCBmb3JtYXRMaW5lcyBsaW5lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZEZvbGRMYWJlbCAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keSBwW2RhdGEtZm9sZC1zdGFydF0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkVGltZUxhYmVsICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5IHBbZGF0YS10aW1lLXN0YXJ0XSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRGb2xkSGFuZGxlcnMgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHkgcFtkYXRhLWZvbGQtc3RhcnRdPmEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbGluZSB0aGVuIGFjdGl2YXRlTGluZSAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keScsIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRGb290ZXIgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHknLCB7YXV0aG9yLCByZXBvLCBsaW5lLCB1cmx9XG5cblxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXF1ZXN0T3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS9hcmNoaXZlLnRyYXZpcy1jaS5vcmcvam9icy8je2lkfS9sb2cudHh0XCJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOlxuICAgICAgICAgICAgICAgICAgICBBY2NlcHQ6ICd0ZXh0L3BsYWluJ1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDUwMDBcblxuXG4gICAgICAgICAgICAkLmFqYXggcmVxdWVzdE9wdGlvbnNcbiAgICAgICAgICAgICAgICAudGhlbiAobGluZXMpIC0+XG4gICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuYXBwZW5kICQgZm9ybWF0TGluZXMobGluZXMpXG4gICAgICAgICAgICAgICAgICAgIGFkZEZvbGRMYWJlbCAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keSBwW2RhdGEtZm9sZC1zdGFydF0nXG4gICAgICAgICAgICAgICAgICAgIGFkZFRpbWVMYWJlbCAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keSBwW2RhdGEtdGltZS1zdGFydF0nXG4gICAgICAgICAgICAgICAgICAgIGFkZEZvbGRIYW5kbGVycyAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keSBwW2RhdGEtZm9sZC1zdGFydF0+YSdcbiAgICAgICAgICAgICAgICAgICAgaWYgbGluZSB0aGVuIGFjdGl2YXRlTGluZSAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keScsIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgYWRkRm9vdGVyICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5Jywge2F1dGhvciwgcmVwbywgbGluZSwgdXJsfVxuXG5cblxuXG4jIGVuZ2luZSBoYW5kbGluZ1xuaWYgbW9kdWxlP1xuICAgICMgZXhwb3J0IGZvciB0ZXN0XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7IHV0aWwsIGFuc2kySHRtbCwgZm9ybWF0TGluZXMgfVxuZWxzZSBpZiB3aW5kb3c/XG4gICAgIyBleGVjIG9uIGJyb3dzZXJcbiAgICAkKGRvY3VtZW50KS5yZWFkeSBtYWluXG4iXX0=
