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
    lines = lines.replace(CR + LF, CR);
    lines = lines.split("\n");
    html = '';
    for (index = j = 0, len = lines.length; j < len; index = ++j) {
      line = lines[index];
      console.log(index + ": " + (escape(line)));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzL29lbWJlZC10cmF2aXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSw4SEFBQTtJQUFBOztFQUFBLElBQUEsR0FDSTtJQUFBLFFBQUEsRUFBVSxTQUFDLElBQUQ7YUFBVSxJQUFJLENBQUMsS0FBTCxDQUFZLElBQUEsR0FBTyxRQUFuQixDQUFBLEdBQStCO0lBQXpDLENBQVY7OztFQUdKLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxTQUFQO0FBQ1IsUUFBQTtJQUFBLElBQUEsR0FBTztJQUNQLEdBQUEsR0FBTSxNQUFNLENBQUMsWUFBUCxDQUFvQixJQUFwQjtJQUNOLEtBQUEsR0FBUTtJQUVSLGFBQUEsR0FBZ0IsU0FBQyxRQUFEO0FBQ1osVUFBQTtNQUFBLElBQU8sZ0JBQVA7QUFBc0IsZUFBTyxHQUE3Qjs7TUFDQSxPQUFBLEdBQVU7QUFDVixXQUFBLGVBQUE7O1FBQ0ksSUFBRyxhQUFIO1VBQWUsT0FBTyxDQUFDLElBQVIsQ0FBZ0IsR0FBRCxHQUFLLEdBQUwsR0FBUSxLQUF2QixFQUFmOztBQURKO0FBRUEsYUFBTyxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWI7SUFMSztJQU9oQixRQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsRUFBUixFQUFZLEVBQVosRUFBZ0IsRUFBaEI7QUFDUCxVQUFBO01BQUEsSUFBRyxHQUFBLEtBQVMsRUFBWjtBQUFvQixlQUFPLE1BQTNCOztNQUNBLElBQUcsQ0FBQyxFQUFBLEtBQU0sRUFBUCxDQUFBLElBQWMsQ0FBQyxJQUFBLEtBQVEsRUFBVCxDQUFqQjtRQUFtQyxFQUFBLEdBQUssSUFBeEM7O01BQ0EsR0FBQSxHQUFNO0FBQ04sV0FBUywrRkFBVDtRQUNJLElBQUEsR0FBTyxRQUFBLENBQVMsU0FBVSxDQUFBLENBQUEsQ0FBbkIsQ0FBc0IsQ0FBQyxRQUF2QixDQUFBO1FBQ1AsSUFBRyxhQUFRLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBWixDQUFSLEVBQUEsSUFBQSxNQUFI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LFlBQVI7V0FGSjtVQUdBLE9BQUEsRUFBUyxJQUhUOztlQU1KLENBQUMsQ0FBQyxJQUFGLENBQU8sY0FBUCxDQUNJLENBQUMsSUFETCxDQUNVLFNBQUMsS0FBRDtVQUNGLFVBQVUsQ0FBQyxNQUFYLENBQWtCLENBQUEsQ0FBRSxXQUFBLENBQVksS0FBWixDQUFGLENBQWxCO1VBQ0EsWUFBQSxDQUFhLFVBQWIsRUFBeUIscUNBQXpCO1VBQ0EsWUFBQSxDQUFhLFVBQWIsRUFBeUIscUNBQXpCO1VBQ0EsZUFBQSxDQUFnQixVQUFoQixFQUE0Qix1Q0FBNUI7VUFDQSxJQUFHLElBQUg7WUFBYSxZQUFBLENBQWEsVUFBYixFQUF5QixrQkFBekIsRUFBNkMsSUFBN0MsRUFBYjs7aUJBQ0EsU0FBQSxDQUFVLFVBQVYsRUFBc0Isa0JBQXRCLEVBQTBDO1lBQUMsUUFBQSxNQUFEO1lBQVMsTUFBQSxJQUFUO1lBQWUsTUFBQSxJQUFmO1lBQXFCLEtBQUEsR0FBckI7V0FBMUM7UUFORSxDQURWLEVBaENKOztJQVZxQixDQUF6QjtFQURHOztFQXdEUCxJQUFHLGdEQUFIO0lBRUksTUFBTSxDQUFDLE9BQVAsR0FBaUI7TUFBRSxNQUFBLElBQUY7TUFBUSxXQUFBLFNBQVI7TUFBbUIsYUFBQSxXQUFuQjtNQUZyQjtHQUFBLE1BR0ssSUFBRyxnREFBSDtJQUVELENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxLQUFaLENBQWtCLElBQWxCLEVBRkM7O0FBbk9MIiwiZmlsZSI6ImpzL29lbWJlZC10cmF2aXMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIHNvbWUgdXRpbGl0aWVzXG51dGlsID1cbiAgICBuc2VjMnNlYzogKG5zZWMpIC0+IE1hdGgucm91bmQoIG5zZWMgLyAxMDAwMDAwMCkgLyAxMDBcblxuIyB0ZXJtaW5hbCBjb2RlcyB0byBIdG1sXG5hbnNpMkh0bWwgPSAobGluZSwgc3R5bGVTZXRzKSAtPlxuICAgIGFuc2kgPSAvKC4pXFxbKFxcZCs7KT8oXFxkKykqbS9nXG4gICAgRVNDID0gU3RyaW5nLmZyb21DaGFyQ29kZSAnMjcnXG4gICAgc3RhY2sgPSAnJ1xuXG4gICAgZ2V0U3R5bGVWYWx1ZSA9IChzdHlsZVNldCkgLT5cbiAgICAgICAgdW5sZXNzIHN0eWxlU2V0PyB0aGVuIHJldHVybiAnJ1xuICAgICAgICByZXN1bHRzID0gW11cbiAgICAgICAgZm9yIGtleSwgdmFsdWUgb2Ygc3R5bGVTZXRcbiAgICAgICAgICAgIGlmIHZhbHVlPyB0aGVuIHJlc3VsdHMucHVzaCBcIiN7a2V5fToje3ZhbHVlfVwiXG4gICAgICAgIHJldHVybiByZXN1bHRzLmpvaW4gJzsnXG5cbiAgICBjYWxsYmFjayA9IChtYXRjaCwgYjAsIGIxLCBiMikgLT5cbiAgICAgICAgaWYgRVNDIGlzbnQgYjAgdGhlbiByZXR1cm4gbWF0Y2hcbiAgICAgICAgaWYgKCcnIGlzIGIyKSBvciAobnVsbCBpcyBiMikgdGhlbiBiMiA9ICcwJ1xuICAgICAgICByZXMgPSAnJ1xuICAgICAgICBmb3IgaSBpbiBbMi4uKGFyZ3VtZW50cy5sZW5ndGggLSAzKV0gI2V4Y2x1ZGUgJ29mZnNldCcgYW5kICdzdHJpbmcnIGFyZ3VtZW50c1xuICAgICAgICAgICAgY29kZSA9IHBhcnNlSW50KGFyZ3VtZW50c1tpXSkudG9TdHJpbmcoKVxuICAgICAgICAgICAgaWYgY29kZSBpbiBPYmplY3Qua2V5cyBzdHlsZVNldHNcbiAgICAgICAgICAgICAgICBzdGFjayArPSAnPC9zcGFuPidcbiAgICAgICAgICAgICAgICByZXMgKz0gJzxzcGFuIHN0eWxlPVwiJyArIGdldFN0eWxlVmFsdWUoc3R5bGVTZXRzW2NvZGVdKSArICdcIj4nXG4gICAgICAgIHJldHVybiByZXNcblxuICAgIHJldHVybiAobGluZS5yZXBsYWNlIGFuc2ksIGNhbGxiYWNrKSArIHN0YWNrXG5cbiMgZGV0ZWN0IGFuZCBwcm9jZXNzIHRyYXZpcyBjb250cm9sIGNvZGVcbmZvcm1hdExpbmVzID0gKGxpbmVzKSAtPlxuICAgIEVTQyA9IFN0cmluZy5mcm9tQ2hhckNvZGUgMjdcbiAgICBDUiA9IFN0cmluZy5mcm9tQ2hhckNvZGUgMTNcbiAgICBMRiA9IFN0cmluZy5mcm9tQ2hhckNvZGUgMTBcbiAgICBsaW5lcyA9IGxpbmVzLnJlcGxhY2UgQ1IgKyBMRiwgQ1JcbiAgICBsaW5lcyA9IGxpbmVzLnNwbGl0IFwiXFxuXCJcblxuICAgIGh0bWwgPSAnJ1xuICAgIGZvciBsaW5lLCBpbmRleCBpbiBsaW5lc1xuICAgICAgICBjb25zb2xlLmxvZyBcIiN7aW5kZXh9OiAje2VzY2FwZShsaW5lKX1cIlxuICAgICAgICBhdHRyID0gJydcbiAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSAvdHJhdmlzXyhmb2xkfHRpbWUpOihzdGFydHxlbmQpOiguKykvZywgKG1hdGNoLCBwMSwgcDIsIHAzKSAtPlxuICAgICAgICAgICAgaWYgcDE/IGFuZCBwMj9cbiAgICAgICAgICAgICAgICBhdHRyICs9IFwiIGRhdGEtI3twMX0tI3twMn09XFxcIiN7cDN9XFxcIlwiXG4gICAgICAgICAgICByZXR1cm4gJydcbiAgICAgICAgbGluZSA9IGFuc2kySHRtbCBsaW5lLCBzdHlsZVNldHNcbiAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSBuZXcgUmVnRXhwKENSLCdnJyksICcnXG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UgbmV3IFJlZ0V4cChFU0MsJ2cnKSwgJydcbiAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSAvXFxbXFxkP1tLR10vZywgJycgIyBtYXliZSB0aGlzIGVyYXNlcyBub24tZXNjYXBlZCBsaW5lXG5cbiAgICAgICAgaHRtbCArPSBcIjxwI3thdHRyfT48YT4je2luZGV4ICsgMX08L2E+I3tsaW5lfTwvcD5cIlxuXG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwidHJhdmlzLWxvZy1ib2R5XFxcIj48ZGl2IGNsYXNzPVxcXCJ0cmF2aXMtcHJlXFxcIj4je2h0bWx9PC9kaXY+PC9kaXY+XCJcblxuXG4jIGRlZmluZSB0ZXJtaW5hbCBjb2RlIHN0eWxlc1xuc3R5bGVTZXRzID1cbiAgICAwOiAgeyAnZm9udC13ZWlnaHQnOiAnbm9ybWFsJywgJ2ZvbnQtc3R5bGUnOiAnbm9ybWFsJywgJ3RleHQtZGVjb3JhdGlvbic6ICdub25lJywnYmFja2dyb3VuZC1jb2xvcic6ICcjMjIyJywgY29sb3I6ICcjZjFmMWYxJyB9XG4gICAgMTogIHsgJ2ZvbnQtd2VpZ2h0JzogJ2JvbGQnIH1cbiAgICAzOiAgeyAnZm9udC1zdHlsZSc6ICdpdGFsaWMnIH1cbiAgICA0OiAgeyAndGV4dC1kZWNvcmF0aW9uJzogJ3VuZGVybGluZScgfVxuICAgIDU6ICB7ICdhbmltYXRpb24nOiAnYmxpbmsgMXMgc3RlcC1lbmQgaW5maW5pdGUnLCAnLXdlYmtpdC1hbmltYXRpb24nOiAnYmxpbmsgMXMgc3RlcC1lbmQgaW5maW5pdGUnIH1cbiAgICA3OiAgeyBpbnZlcnQ6IHRydWUgfVxuICAgIDk6ICB7ICd0ZXh0LWRlY29yYXRpb24nOiAnbGluZS10aHJvdWdoJyB9XG4gICAgMjM6IHsgJ2ZvbnQtc3R5bGUnOiAnbm9ybWFsJyB9XG4gICAgMjQ6IHsgJ3RleHQtZGVjb3JhdGlvbic6ICdub25lJyB9XG4gICAgMjU6IHsgJ2FuaW1hdGlvbic6ICdub25lJywgJy13ZWJraXQtYW5pbWF0aW9uJzogJ25vbmUnIH1cbiAgICAyNzogeyBpbnZlcnQ6IGZhbHNlIH1cbiAgICAyOTogeyAndGV4dC1kZWNvcmF0aW9uJzogJ25vbmUnIH1cbiAgICAzMDogeyBjb2xvcjogJyM0RTRFNEUnIH0gIyBibGFja1xuICAgIDMxOiB7IGNvbG9yOiAnI0ZGOUI5MycgfSAjIHJlZFxuICAgIDMyOiB7IGNvbG9yOiAnI0IxRkQ3OScgfSAjIGdyZWVuXG4gICAgMzM6IHsgY29sb3I6ICcjRkZGRkI2JyB9ICMgeWVsbG93XG4gICAgMzQ6IHsgY29sb3I6ICcjQjVEQ0ZFJyB9ICMgYmx1ZVxuICAgIDM1OiB7IGNvbG9yOiAnI0ZGNzNGRCcgfSAjIG1hZ2VtdGFcbiAgICAzNjogeyBjb2xvcjogJyNFMEZGRkYnIH0gIyBjeWFuXG4gICAgMzc6IHsgY29sb3I6ICcjZjFmMWYxJyB9ICMgd2hpdGVcbiAgICAzOTogeyBjb2xvcjogJyNmMWYxZjEnIH0gI2RlZmF1bHRcbiAgICA0MDogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjNEU0RTRFJyB9ICMgYmxhY2tcbiAgICA0MTogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjRkY5QjkzJyB9ICMgcmVkXG4gICAgNDI6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI0IxRkQ3OScgfSAjIGdyZWVuXG4gICAgNDM6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI0ZGRkZCNicgfSAjIHllbGxvd1xuICAgIDQ0OiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNCNURDRkUnIH0gIyBibHVlXG4gICAgNDU6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI0ZGNzNGRCcgfSAjIG1hZ2VtdGFcbiAgICA0NjogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjRTBGRkZGJyB9ICMgY3lhblxuICAgIDQ3OiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNmMWYxZjEnIH0gIyB3aGl0ZVxuICAgIDQ5OiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyMyMjInIH0gIyBkZWZhdWx0XG5cblxuaWYgd2luZG93PyB0aGVuICQgPSBqUXVlcnlcblxuXG5hZGRGb2xkTGFiZWwgPSAoJGNvbnRhaW5lciwgc2VsZWN0b3IpIC0+XG4gICAgJGNvbnRhaW5lci5maW5kKHNlbGVjdG9yKS5lYWNoIC0+XG4gICAgICAgICQodGhpcykucHJlcGVuZCAkICc8c3BhbiBjbGFzcz1cInRyYXZpcy1pbmZvIHRyYXZpcy1mb2xkLXN0YXJ0XCI+JyArICgkKHRoaXMpLmRhdGEgJ2ZvbGQtc3RhcnQnKSArICc8L3NwYW4+J1xuXG5cbmFkZFRpbWVMYWJlbCA9ICgkY29udGFpbmVyLCBzZWxlY3RvcikgLT5cbiAgICAkY29udGFpbmVyLmZpbmQoc2VsZWN0b3IpLmVhY2ggLT5cbiAgICAgICAgJG4gPSAkKHRoaXMpXG4gICAgICAgIHVudGlsICgkbi5kYXRhICd0aW1lLWVuZCcpIG9yICgkbi5sZW5ndGggaXMgMClcbiAgICAgICAgICAgICRuID0gJG4ubmV4dCgpXG4gICAgICAgIGlmICRuLmRhdGEoJ3RpbWUtZW5kJylcbiAgICAgICAgICAgIGR1cmF0aW9uID0gdXRpbC5uc2VjMnNlYyAoJycpICsgJG4uZGF0YSgndGltZS1lbmQnKS5tYXRjaCgvZHVyYXRpb249KFxcZCopJC8pWzFdXG4gICAgICAgICAgICBpZiBkdXJhdGlvbiB0aGVuICQodGhpcykucHJlcGVuZCAkIFwiPHNwYW4gY2xhc3M9XFxcInRyYXZpcy1pbmZvIHRyYXZpcy10aW1lLXN0YXJ0XFxcIj4je2R1cmF0aW9ufXM8L3NwYW4+XCJcblxuXG50b2dnbGUgPSAoJGhhbmRsZSwgYm9vbCkgLT5cbiAgICBbb3BlbmVkLCBjbG9zZWRdID0gWyd0cmF2aXMtZm9sZC1jbG9zZScsICd0cmF2aXMtZm9sZC1vcGVuJ11cbiAgICAkaGFuZGxlLnJlbW92ZUNsYXNzKGlmIGJvb2wgdGhlbiBjbG9zZWQgZWxzZSBvcGVuZWQpXG4gICAgJGhhbmRsZS5hZGRDbGFzcyhpZiBib29sIHRoZW4gb3BlbmVkIGVsc2UgY2xvc2VkKVxuICAgICRuID0gJGhhbmRsZS5uZXh0KClcbiAgICBsYWJlbCA9ICRoYW5kbGUuZGF0YSAnZm9sZC1zdGFydCdcbiAgICB1bnRpbCAobGFiZWwgaXMgJG4uZGF0YSAnZm9sZC1lbmQnKSBvciAoJG4uZGF0YSAnZm9sZC1zdGFydCcpPyBvciAoJG4ubGVuZ3RoIGlzIDApXG4gICAgICAgICRuW2lmIGJvb2wgdGhlbiAnc2hvdycgZWxzZSAnaGlkZSddKClcbiAgICAgICAgJG4gPSAkbi5uZXh0KClcblxuXG5hZGRGb2xkSGFuZGxlcnMgPSAoJGNvbnRhaW5lciwgc2VsZWN0b3IpIC0+XG4gICAgW29wZW5lZCwgY2xvc2VkXSA9IFsndHJhdmlzLWZvbGQtY2xvc2UnLCAndHJhdmlzLWZvbGQtb3BlbiddXG4gICAgJGNvbnRhaW5lci5maW5kKHNlbGVjdG9yKVxuICAgICAgICAuYWRkQ2xhc3MgY2xvc2VkXG4gICAgICAgIC5lYWNoIC0+XG4gICAgICAgICAgICB0b2dnbGUoJCh0aGlzKS5wYXJlbnQoKSwgZmFsc2UpXG4gICAgICAgICAgICAkKHRoaXMpLmNsaWNrIC0+XG4gICAgICAgICAgICAgICAgICAgICRwID0gJCh0aGlzKS5wYXJlbnQoKVxuICAgICAgICAgICAgICAgICAgICBpZiAkcC5oYXNDbGFzcyBvcGVuZWQgdGhlbiB0b2dnbGUoJHAsIGZhbHNlKSBlbHNlIHRvZ2dsZSgkcCwgdHJ1ZSlcblxuXG5hY3RpdmF0ZUxpbmUgPSAoJGNvbnRhaW5lciwgc2VsZWN0b3IsIGxpbmUpIC0+XG4gICAgJHByZSA9ICRjb250YWluZXIuZmluZChcIiN7c2VsZWN0b3J9IC50cmF2aXMtcHJlXCIpXG4gICAgJHAgICA9ICRjb250YWluZXIuZmluZChcIiN7c2VsZWN0b3J9IHBcIikuZXEobGluZSAtIDEpXG4gICAgaWYgJHAubGVuZ3RoIGlzIDAgdGhlbiByZXR1cm5cbiAgICAkcC5hZGRDbGFzcyAndHJhdmlzLWdpdmVuLWFjdGl2ZS1saW5lJ1xuICAgIGlmICRwLmNzcygnZGlzcGxheScpIGlzICdub25lJ1xuICAgICAgICAkcG9pbnRlciA9ICRwXG4gICAgICAgIHVudGlsICgkcG9pbnRlci5kYXRhICdmb2xkLXN0YXJ0Jykgb3IgKCRwb2ludGVyLmxlbmd0aCBpcyAwKVxuICAgICAgICAgICAgJHBvaW50ZXIgPSAkcG9pbnRlci5wcmV2KClcbiAgICAgICAgdG9nZ2xlKCRwb2ludGVyLCB0cnVlKVxuICAgIGJvZHlIZWlnaHQgPSAkcHJlLmhlaWdodCgpXG4gICAgbGluZVRvcCAgICA9ICRwLnBvc2l0aW9uKCkudG9wIC0gJHByZS5wb3NpdGlvbigpLnRvcFxuICAgIGxpbmVIZWlnaHQgPSAkcC5oZWlnaHQoKVxuICAgIGQgPSBsaW5lVG9wIC0gKGJvZHlIZWlnaHQgLyAyKSArIChsaW5lSGVpZ2h0IC8gMilcbiAgICAkcHJlLnNjcm9sbFRvcCBkXG5cblxuYWRkRm9vdGVyID0gKCRjb250YWluZXIsIHNlbGVjdG9yLCBhcmcpIC0+XG4gICAge2F1dGhvciwgcmVwbywgbGluZSwgdXJsfSA9IGFyZ1xuICAgIGlmIGF1dGhvciBhbmQgcmVwb1xuICAgICAgICBjb250ZW50ID0gXCIje2F1dGhvcn0vI3tyZXBvfVwiXG4gICAgICAgICMgbmVlZCB0byBpbmplY3QgYnJhbmNoIGluZm9ybWF0aW9uIHRvIHNob3cgYmFkZ2VcbiAgICAgICAgIyBiYWRnZSA9IFwiPGltZyBjbGFzcz1cXFwidHJhdmlzLWJhZGdlXFxcIiBzcmM9XFxcImh0dHBzOi8vYXBpLnRyYXZpcy1jaS5vcmcvI3thdXRob3J9LyN7cmVwb30uc3ZnP2JyYW5jaD0je2JyYW5jaH1cXFwiIGFsdD1cXFwic3RhdGVcXFwiIC8+XCJcbiAgICBlbHNlXG4gICAgICAgIGNvbnRlbnQgPSAnVGhpcyByZXBvc2l0b3J5J1xuICAgICAgICBiYWRnZSA9ICcnXG4gICAgIyBjaGVjayBpZiBsaW5lIGlzIHZhbGlkKG5vdCBiZSBvdmVyIGFsbCBsaW5lIGxlbmd0aClcbiAgICBpZiBsaW5lIGFuZCAkY29udGFpbmVyLmZpbmQoXCIje3NlbGVjdG9yfSBwXCIpLmVxKGxpbmUgLSAxKS5sZW5ndGggPiAwXG4gICAgICAgIGNvbnRlbnQgPSBcIiN7Y29udGVudH0jTCN7bGluZX1cIlxuICAgIGlmIHVybFxuICAgICAgICBjb250ZW50ID0gXCI8YSBocmVmPVxcXCIje3VybH1cXFwiPiN7Y29udGVudH08L2E+XCJcbiAgICAkY29udGFpbmVyLmFwcGVuZCAkIFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XFxcInRyYXZpcy1sb2ctZm9vdGVyXFxcIj48aDIgY2xhc3M9XCJ0cmF2aXMtZm9vdGVyLXRleHRcIj5cbiAgICAgICAgI3tjb250ZW50fSBidWlsdCB3aXRoIDxhIGhyZWY9XFxcImh0dHBzOi8vdHJhdmlzLWNpLm9yZ1xcXCI+VHJhdmlzIENJPC9hPi5cbiAgICA8L2gyPjwvZGl2PlxuICAgIFwiXCJcIlxuXG5cbiMgbWFpbiBtb2R1bGVcbm1haW4gPSAtPlxuICAgICQoJy5vZW1iZWQtdHJhdmlzJykuZWFjaCAtPlxuICAgICAgICAkY29udGFpbmVyID0gJCB0aGlzXG4gICAgICAgIGlmICRjb250YWluZXIuY2hpbGRyZW4gPiAwIHRoZW4gcmV0dXJuXG4gICAgICAgIHVybCAgICA9ICRjb250YWluZXIuZGF0YSAndXJsJ1xuICAgICAgICBhdXRob3IgPSAkY29udGFpbmVyLmRhdGEgJ2F1dGhvcidcbiAgICAgICAgcmVwbyAgID0gJGNvbnRhaW5lci5kYXRhICdyZXBvJ1xuICAgICAgICB0eXBlICAgPSBpZiAkY29udGFpbmVyLmRhdGEgJ2J1aWxkcycgdGhlbiAnYnVpbGRzJyBlbHNlICdqb2JzJ1xuICAgICAgICBpZCAgICAgPSAkY29udGFpbmVyLmRhdGEgdHlwZVxuICAgICAgICBsaW5lICAgPSAkY29udGFpbmVyLmRhdGEgJ2xpbmUnXG5cbiAgICAgICAgaWYgdHlwZSBpcyAnYnVpbGRzJ1xuICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMgPVxuICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL2FwaS50cmF2aXMtY2kub3JnL2J1aWxkcy8je2lkfVwiXG4gICAgICAgICAgICAgICAgaGVhZGVyczpcbiAgICAgICAgICAgICAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vdm5kLnRyYXZpcy1jaS4yK2pzb24nXG5cbiAgICAgICAgICAgICQuYWpheCByZXF1ZXN0T3B0aW9uc1xuICAgICAgICAgICAgICAgIC50aGVuICh7am9ic30pIC0+XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vYXJjaGl2ZS50cmF2aXMtY2kub3JnL2pvYnMvI3tqb2JzWzBdLmlkfS9sb2cudHh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQWNjZXB0OiAndGV4dC9wbGFpbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDUwMDBcblxuICAgICAgICAgICAgICAgICAgICAkLmFqYXggcmVxdWVzdE9wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuIChsaW5lcykgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmFwcGVuZCAkIGZvcm1hdExpbmVzIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRm9sZExhYmVsICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5IHBbZGF0YS1mb2xkLXN0YXJ0XSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRUaW1lTGFiZWwgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHkgcFtkYXRhLXRpbWUtc3RhcnRdJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZEZvbGRIYW5kbGVycyAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keSBwW2RhdGEtZm9sZC1zdGFydF0+YSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBsaW5lIHRoZW4gYWN0aXZhdGVMaW5lICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5JywgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZEZvb3RlciAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keScsIHthdXRob3IsIHJlcG8sIGxpbmUsIHVybH1cblxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zID1cbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2FyY2hpdmUudHJhdmlzLWNpLm9yZy9qb2JzLyN7aWR9L2xvZy50eHRcIlxuICAgICAgICAgICAgICAgIGhlYWRlcnM6XG4gICAgICAgICAgICAgICAgICAgIEFjY2VwdDogJ3RleHQvcGxhaW4nXG4gICAgICAgICAgICAgICAgdGltZW91dDogNTAwMFxuXG5cbiAgICAgICAgICAgICQuYWpheCByZXF1ZXN0T3B0aW9uc1xuICAgICAgICAgICAgICAgIC50aGVuIChsaW5lcykgLT5cbiAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5hcHBlbmQgJCBmb3JtYXRMaW5lcyhsaW5lcylcbiAgICAgICAgICAgICAgICAgICAgYWRkRm9sZExhYmVsICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5IHBbZGF0YS1mb2xkLXN0YXJ0XSdcbiAgICAgICAgICAgICAgICAgICAgYWRkVGltZUxhYmVsICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5IHBbZGF0YS10aW1lLXN0YXJ0XSdcbiAgICAgICAgICAgICAgICAgICAgYWRkRm9sZEhhbmRsZXJzICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5IHBbZGF0YS1mb2xkLXN0YXJ0XT5hJ1xuICAgICAgICAgICAgICAgICAgICBpZiBsaW5lIHRoZW4gYWN0aXZhdGVMaW5lICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5JywgbGluZVxuICAgICAgICAgICAgICAgICAgICBhZGRGb290ZXIgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHknLCB7YXV0aG9yLCByZXBvLCBsaW5lLCB1cmx9XG5cblxuXG5cbiMgZW5naW5lIGhhbmRsaW5nXG5pZiBtb2R1bGU/XG4gICAgIyBleHBvcnQgZm9yIHRlc3RcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHsgdXRpbCwgYW5zaTJIdG1sLCBmb3JtYXRMaW5lcyB9XG5lbHNlIGlmIHdpbmRvdz9cbiAgICAjIGV4ZWMgb24gYnJvd3NlclxuICAgICQoZG9jdW1lbnQpLnJlYWR5IG1haW5cbiJdfQ==
