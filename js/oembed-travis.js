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
      content = "<a class=\"travis-link-text\" href=\"" + url + "\">" + content + "</a>";
    }
    return $container.append($("<div class=\"travis-log-footer\"><div class=\"travis-footer-text\">\n    " + content + " built with <a class=\"travis-link-text\" href=\"https://travis-ci.org\">Travis CI</a>.\n</div></div>"));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzL29lbWJlZC10cmF2aXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSw4SEFBQTtJQUFBOztFQUFBLElBQUEsR0FDSTtJQUFBLFFBQUEsRUFBVSxTQUFDLElBQUQ7YUFBVSxJQUFJLENBQUMsS0FBTCxDQUFZLElBQUEsR0FBTyxRQUFuQixDQUFBLEdBQStCO0lBQXpDLENBQVY7OztFQUdKLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxTQUFQO0FBQ1IsUUFBQTtJQUFBLElBQUEsR0FBTztJQUNQLEdBQUEsR0FBTSxNQUFNLENBQUMsWUFBUCxDQUFvQixJQUFwQjtJQUNOLEtBQUEsR0FBUTtJQUVSLGFBQUEsR0FBZ0IsU0FBQyxRQUFEO0FBQ1osVUFBQTtNQUFBLElBQU8sZ0JBQVA7QUFBc0IsZUFBTyxHQUE3Qjs7TUFDQSxPQUFBLEdBQVU7QUFDVixXQUFBLGVBQUE7O1FBQ0ksSUFBRyxhQUFIO1VBQWUsT0FBTyxDQUFDLElBQVIsQ0FBZ0IsR0FBRCxHQUFLLEdBQUwsR0FBUSxLQUF2QixFQUFmOztBQURKO0FBRUEsYUFBTyxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWI7SUFMSztJQU9oQixRQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsRUFBUixFQUFZLEVBQVosRUFBZ0IsRUFBaEI7QUFDUCxVQUFBO01BQUEsSUFBRyxHQUFBLEtBQVMsRUFBWjtBQUFvQixlQUFPLE1BQTNCOztNQUNBLElBQUcsQ0FBQyxFQUFBLEtBQU0sRUFBUCxDQUFBLElBQWMsQ0FBQyxJQUFBLEtBQVEsRUFBVCxDQUFqQjtRQUFtQyxFQUFBLEdBQUssSUFBeEM7O01BQ0EsR0FBQSxHQUFNO0FBQ04sV0FBUywrRkFBVDtRQUNJLElBQUEsR0FBTyxRQUFBLENBQVMsU0FBVSxDQUFBLENBQUEsQ0FBbkIsQ0FBc0IsQ0FBQyxRQUF2QixDQUFBO1FBQ1AsSUFBRyxhQUFRLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBWixDQUFSLEVBQUEsSUFBQSxNQUFI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QUNJLENBQUMsSUFETCxDQUNVLFNBQUMsS0FBRDtVQUNGLFVBQVUsQ0FBQyxNQUFYLENBQWtCLENBQUEsQ0FBRSxXQUFBLENBQVksS0FBWixDQUFGLENBQWxCO1VBQ0EsWUFBQSxDQUFhLFVBQWIsRUFBeUIscUNBQXpCO1VBQ0EsWUFBQSxDQUFhLFVBQWIsRUFBeUIscUNBQXpCO1VBQ0EsZUFBQSxDQUFnQixVQUFoQixFQUE0Qix1Q0FBNUI7VUFDQSxJQUFHLElBQUg7WUFBYSxZQUFBLENBQWEsVUFBYixFQUF5QixrQkFBekIsRUFBNkMsSUFBN0MsRUFBYjs7aUJBQ0EsU0FBQSxDQUFVLFVBQVYsRUFBc0Isa0JBQXRCLEVBQTBDO1lBQUMsUUFBQSxNQUFEO1lBQVMsTUFBQSxJQUFUO1lBQWUsTUFBQSxJQUFmO1lBQXFCLEtBQUEsR0FBckI7V0FBMUM7UUFORSxDQURWLEVBaENKOztJQVZxQixDQUF6QjtFQURHOztFQXdEUCxJQUFHLGdEQUFIO0lBRUksTUFBTSxDQUFDLE9BQVAsR0FBaUI7TUFBRSxNQUFBLElBQUY7TUFBUSxXQUFBLFNBQVI7TUFBbUIsYUFBQSxXQUFuQjtNQUZyQjtHQUFBLE1BR0ssSUFBRyxnREFBSDtJQUVELENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxLQUFaLENBQWtCLElBQWxCLEVBRkM7O0FBcE9MIiwiZmlsZSI6ImpzL29lbWJlZC10cmF2aXMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIHNvbWUgdXRpbGl0aWVzXG51dGlsID1cbiAgICBuc2VjMnNlYzogKG5zZWMpIC0+IE1hdGgucm91bmQoIG5zZWMgLyAxMDAwMDAwMCkgLyAxMDBcblxuIyB0ZXJtaW5hbCBjb2RlcyB0byBIdG1sXG5hbnNpMkh0bWwgPSAobGluZSwgc3R5bGVTZXRzKSAtPlxuICAgIGFuc2kgPSAvKC4pXFxbKFxcZCs7KT8oXFxkKykqbS9nXG4gICAgRVNDID0gU3RyaW5nLmZyb21DaGFyQ29kZSAnMjcnXG4gICAgc3RhY2sgPSAnJ1xuXG4gICAgZ2V0U3R5bGVWYWx1ZSA9IChzdHlsZVNldCkgLT5cbiAgICAgICAgdW5sZXNzIHN0eWxlU2V0PyB0aGVuIHJldHVybiAnJ1xuICAgICAgICByZXN1bHRzID0gW11cbiAgICAgICAgZm9yIGtleSwgdmFsdWUgb2Ygc3R5bGVTZXRcbiAgICAgICAgICAgIGlmIHZhbHVlPyB0aGVuIHJlc3VsdHMucHVzaCBcIiN7a2V5fToje3ZhbHVlfVwiXG4gICAgICAgIHJldHVybiByZXN1bHRzLmpvaW4gJzsnXG5cbiAgICBjYWxsYmFjayA9IChtYXRjaCwgYjAsIGIxLCBiMikgLT5cbiAgICAgICAgaWYgRVNDIGlzbnQgYjAgdGhlbiByZXR1cm4gbWF0Y2hcbiAgICAgICAgaWYgKCcnIGlzIGIyKSBvciAobnVsbCBpcyBiMikgdGhlbiBiMiA9ICcwJ1xuICAgICAgICByZXMgPSAnJ1xuICAgICAgICBmb3IgaSBpbiBbMi4uKGFyZ3VtZW50cy5sZW5ndGggLSAzKV0gI2V4Y2x1ZGUgJ29mZnNldCcgYW5kICdzdHJpbmcnIGFyZ3VtZW50c1xuICAgICAgICAgICAgY29kZSA9IHBhcnNlSW50KGFyZ3VtZW50c1tpXSkudG9TdHJpbmcoKVxuICAgICAgICAgICAgaWYgY29kZSBpbiBPYmplY3Qua2V5cyBzdHlsZVNldHNcbiAgICAgICAgICAgICAgICBzdGFjayArPSAnPC9zcGFuPidcbiAgICAgICAgICAgICAgICByZXMgKz0gJzxzcGFuIHN0eWxlPVwiJyArIGdldFN0eWxlVmFsdWUoc3R5bGVTZXRzW2NvZGVdKSArICdcIj4nXG4gICAgICAgIHJldHVybiByZXNcblxuICAgIHJldHVybiAobGluZS5yZXBsYWNlIGFuc2ksIGNhbGxiYWNrKSArIHN0YWNrXG5cbiMgZGV0ZWN0IGFuZCBwcm9jZXNzIHRyYXZpcyBjb250cm9sIGNvZGVcbmZvcm1hdExpbmVzID0gKGxpbmVzKSAtPlxuICAgIEVTQyA9IFN0cmluZy5mcm9tQ2hhckNvZGUgMjdcbiAgICBDUiA9IFN0cmluZy5mcm9tQ2hhckNvZGUgMTNcbiAgICBMRiA9IFN0cmluZy5mcm9tQ2hhckNvZGUgMTBcbiAgICBsaW5lcyA9IGxpbmVzLnJlcGxhY2UgJ1swRycgKyBDUiArIExGLCAnJ1xuICAgIGxpbmVzID0gbGluZXMuc3BsaXQgTEZcbiAgICBodG1sID0gJydcblxuICAgIGZvciBsaW5lLCBpbmRleCBpbiBsaW5lc1xuICAgICAgICAjIGNvbnNvbGUubG9nIFwiI3tpbmRleCArIDF9OiAje2VzY2FwZSBsaW5lfVwiXG4gICAgICAgICMgY29uc29sZS5sb2cgL14lMUIlNUIwbSglMUIlNUIwRyhbLS9dfCVbNzVdQykpKyUxQiU1QjBHJTBEJC8udGVzdCBlc2NhcGUgbGluZVxuICAgICAgICBhdHRyID0gJydcbiAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSAvdHJhdmlzXyhmb2xkfHRpbWUpOihzdGFydHxlbmQpOiguKykvZywgKG1hdGNoLCBwMSwgcDIsIHAzKSAtPlxuICAgICAgICAgICAgaWYgcDE/IGFuZCBwMj9cbiAgICAgICAgICAgICAgICBhdHRyICs9IFwiIGRhdGEtI3twMX0tI3twMn09XFxcIiN7cDN9XFxcIlwiXG4gICAgICAgICAgICByZXR1cm4gJydcbiAgICAgICAgbGluZSA9IGFuc2kySHRtbChsaW5lLCBzdHlsZVNldHMpXG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UgbmV3IFJlZ0V4cChDUiwnZycpLCAnJ1xuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlIG5ldyBSZWdFeHAoRVNDLCdnJyksICcnXG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UgL1xcW1xcZD9bS0ddL2csICcnICMgbWF5YmUgdGhpcyBlcmFzZXMgbm9uLWVzY2FwZWQgbGluZVxuXG4gICAgICAgIGh0bWwgKz0gXCI8cCN7YXR0cn0+PGE+I3tpbmRleCArIDF9PC9hPiN7bGluZX08L3A+XCJcblxuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcInRyYXZpcy1sb2ctYm9keVxcXCI+PGRpdiBjbGFzcz1cXFwidHJhdmlzLXByZVxcXCI+I3todG1sfTwvZGl2PjwvZGl2PlwiXG5cblxuIyBkZWZpbmUgdGVybWluYWwgY29kZSBzdHlsZXNcbnN0eWxlU2V0cyA9XG4gICAgMDogIHsgJ2ZvbnQtd2VpZ2h0JzogJ25vcm1hbCcsICdmb250LXN0eWxlJzogJ25vcm1hbCcsICd0ZXh0LWRlY29yYXRpb24nOiAnbm9uZScsJ2JhY2tncm91bmQtY29sb3InOiAnIzIyMicsIGNvbG9yOiAnI2YxZjFmMScgfVxuICAgIDE6ICB7ICdmb250LXdlaWdodCc6ICdib2xkJyB9XG4gICAgMzogIHsgJ2ZvbnQtc3R5bGUnOiAnaXRhbGljJyB9XG4gICAgNDogIHsgJ3RleHQtZGVjb3JhdGlvbic6ICd1bmRlcmxpbmUnIH1cbiAgICA1OiAgeyAnYW5pbWF0aW9uJzogJ2JsaW5rIDFzIHN0ZXAtZW5kIGluZmluaXRlJywgJy13ZWJraXQtYW5pbWF0aW9uJzogJ2JsaW5rIDFzIHN0ZXAtZW5kIGluZmluaXRlJyB9XG4gICAgNzogIHsgaW52ZXJ0OiB0cnVlIH1cbiAgICA5OiAgeyAndGV4dC1kZWNvcmF0aW9uJzogJ2xpbmUtdGhyb3VnaCcgfVxuICAgIDIzOiB7ICdmb250LXN0eWxlJzogJ25vcm1hbCcgfVxuICAgIDI0OiB7ICd0ZXh0LWRlY29yYXRpb24nOiAnbm9uZScgfVxuICAgIDI1OiB7ICdhbmltYXRpb24nOiAnbm9uZScsICctd2Via2l0LWFuaW1hdGlvbic6ICdub25lJyB9XG4gICAgMjc6IHsgaW52ZXJ0OiBmYWxzZSB9XG4gICAgMjk6IHsgJ3RleHQtZGVjb3JhdGlvbic6ICdub25lJyB9XG4gICAgMzA6IHsgY29sb3I6ICcjNEU0RTRFJyB9ICMgYmxhY2tcbiAgICAzMTogeyBjb2xvcjogJyNGRjlCOTMnIH0gIyByZWRcbiAgICAzMjogeyBjb2xvcjogJyNCMUZENzknIH0gIyBncmVlblxuICAgIDMzOiB7IGNvbG9yOiAnI0ZGRkZCNicgfSAjIHllbGxvd1xuICAgIDM0OiB7IGNvbG9yOiAnI0I1RENGRScgfSAjIGJsdWVcbiAgICAzNTogeyBjb2xvcjogJyNGRjczRkQnIH0gIyBtYWdlbXRhXG4gICAgMzY6IHsgY29sb3I6ICcjRTBGRkZGJyB9ICMgY3lhblxuICAgIDM3OiB7IGNvbG9yOiAnI2YxZjFmMScgfSAjIHdoaXRlXG4gICAgMzk6IHsgY29sb3I6ICcjZjFmMWYxJyB9ICNkZWZhdWx0XG4gICAgNDA6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnIzRFNEU0RScgfSAjIGJsYWNrXG4gICAgNDE6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI0ZGOUI5MycgfSAjIHJlZFxuICAgIDQyOiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNCMUZENzknIH0gIyBncmVlblxuICAgIDQzOiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGRkZGQjYnIH0gIyB5ZWxsb3dcbiAgICA0NDogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjQjVEQ0ZFJyB9ICMgYmx1ZVxuICAgIDQ1OiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGRjczRkQnIH0gIyBtYWdlbXRhXG4gICAgNDY6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI0UwRkZGRicgfSAjIGN5YW5cbiAgICA0NzogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjZjFmMWYxJyB9ICMgd2hpdGVcbiAgICA0OTogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjMjIyJyB9ICMgZGVmYXVsdFxuXG4jIGZvciB0ZXN0XG5pZiB3aW5kb3c/IHRoZW4gJCA9IGpRdWVyeVxuXG5cbmFkZEZvbGRMYWJlbCA9ICgkY29udGFpbmVyLCBzZWxlY3RvcikgLT5cbiAgICAkY29udGFpbmVyLmZpbmQoc2VsZWN0b3IpLmVhY2ggLT5cbiAgICAgICAgJCh0aGlzKS5wcmVwZW5kICQgJzxzcGFuIGNsYXNzPVwidHJhdmlzLWluZm8gdHJhdmlzLWZvbGQtc3RhcnRcIj4nICsgKCQodGhpcykuZGF0YSAnZm9sZC1zdGFydCcpICsgJzwvc3Bhbj4nXG5cblxuYWRkVGltZUxhYmVsID0gKCRjb250YWluZXIsIHNlbGVjdG9yKSAtPlxuICAgICRjb250YWluZXIuZmluZChzZWxlY3RvcikuZWFjaCAtPlxuICAgICAgICAkbiA9ICQodGhpcylcbiAgICAgICAgdW50aWwgKCRuLmRhdGEgJ3RpbWUtZW5kJykgb3IgKCRuLmxlbmd0aCBpcyAwKVxuICAgICAgICAgICAgJG4gPSAkbi5uZXh0KClcbiAgICAgICAgaWYgJG4uZGF0YSgndGltZS1lbmQnKVxuICAgICAgICAgICAgZHVyYXRpb24gPSB1dGlsLm5zZWMyc2VjICgnJykgKyAkbi5kYXRhKCd0aW1lLWVuZCcpLm1hdGNoKC9kdXJhdGlvbj0oXFxkKikkLylbMV1cbiAgICAgICAgICAgIGlmIGR1cmF0aW9uIHRoZW4gJCh0aGlzKS5wcmVwZW5kICQgXCI8c3BhbiBjbGFzcz1cXFwidHJhdmlzLWluZm8gdHJhdmlzLXRpbWUtc3RhcnRcXFwiPiN7ZHVyYXRpb259czwvc3Bhbj5cIlxuXG5cbnRvZ2dsZSA9ICgkaGFuZGxlLCBib29sKSAtPlxuICAgIFtvcGVuZWQsIGNsb3NlZF0gPSBbJ3RyYXZpcy1mb2xkLWNsb3NlJywgJ3RyYXZpcy1mb2xkLW9wZW4nXVxuICAgICRoYW5kbGUucmVtb3ZlQ2xhc3MoaWYgYm9vbCB0aGVuIGNsb3NlZCBlbHNlIG9wZW5lZClcbiAgICAkaGFuZGxlLmFkZENsYXNzKGlmIGJvb2wgdGhlbiBvcGVuZWQgZWxzZSBjbG9zZWQpXG4gICAgJG4gPSAkaGFuZGxlLm5leHQoKVxuICAgIGxhYmVsID0gJGhhbmRsZS5kYXRhICdmb2xkLXN0YXJ0J1xuICAgIHVudGlsIChsYWJlbCBpcyAkbi5kYXRhICdmb2xkLWVuZCcpIG9yICgkbi5kYXRhICdmb2xkLXN0YXJ0Jyk/IG9yICgkbi5sZW5ndGggaXMgMClcbiAgICAgICAgJG5baWYgYm9vbCB0aGVuICdzaG93JyBlbHNlICdoaWRlJ10oKVxuICAgICAgICAkbiA9ICRuLm5leHQoKVxuXG5cbmFkZEZvbGRIYW5kbGVycyA9ICgkY29udGFpbmVyLCBzZWxlY3RvcikgLT5cbiAgICBbb3BlbmVkLCBjbG9zZWRdID0gWyd0cmF2aXMtZm9sZC1jbG9zZScsICd0cmF2aXMtZm9sZC1vcGVuJ11cbiAgICAkY29udGFpbmVyLmZpbmQoc2VsZWN0b3IpXG4gICAgICAgIC5hZGRDbGFzcyBjbG9zZWRcbiAgICAgICAgLmVhY2ggLT5cbiAgICAgICAgICAgIHRvZ2dsZSgkKHRoaXMpLnBhcmVudCgpLCBmYWxzZSlcbiAgICAgICAgICAgICQodGhpcykuY2xpY2sgLT5cbiAgICAgICAgICAgICAgICAgICAgJHAgPSAkKHRoaXMpLnBhcmVudCgpXG4gICAgICAgICAgICAgICAgICAgIGlmICRwLmhhc0NsYXNzIG9wZW5lZCB0aGVuIHRvZ2dsZSgkcCwgZmFsc2UpIGVsc2UgdG9nZ2xlKCRwLCB0cnVlKVxuXG5cbmFjdGl2YXRlTGluZSA9ICgkY29udGFpbmVyLCBzZWxlY3RvciwgbGluZSkgLT5cbiAgICAkcHJlID0gJGNvbnRhaW5lci5maW5kKFwiI3tzZWxlY3Rvcn0gLnRyYXZpcy1wcmVcIilcbiAgICAkcCAgID0gJGNvbnRhaW5lci5maW5kKFwiI3tzZWxlY3Rvcn0gcFwiKS5lcShsaW5lIC0gMSlcbiAgICBpZiAkcC5sZW5ndGggaXMgMCB0aGVuIHJldHVyblxuICAgICRwLmFkZENsYXNzICd0cmF2aXMtZ2l2ZW4tYWN0aXZlLWxpbmUnXG4gICAgaWYgJHAuY3NzKCdkaXNwbGF5JykgaXMgJ25vbmUnXG4gICAgICAgICRwb2ludGVyID0gJHBcbiAgICAgICAgdW50aWwgKCRwb2ludGVyLmRhdGEgJ2ZvbGQtc3RhcnQnKSBvciAoJHBvaW50ZXIubGVuZ3RoIGlzIDApXG4gICAgICAgICAgICAkcG9pbnRlciA9ICRwb2ludGVyLnByZXYoKVxuICAgICAgICB0b2dnbGUoJHBvaW50ZXIsIHRydWUpXG4gICAgYm9keUhlaWdodCA9ICRwcmUuaGVpZ2h0KClcbiAgICBsaW5lVG9wICAgID0gJHAucG9zaXRpb24oKS50b3AgLSAkcHJlLnBvc2l0aW9uKCkudG9wXG4gICAgbGluZUhlaWdodCA9ICRwLmhlaWdodCgpXG4gICAgZCA9IGxpbmVUb3AgLSAoYm9keUhlaWdodCAvIDIpICsgKGxpbmVIZWlnaHQgLyAyKVxuICAgICRwcmUuc2Nyb2xsVG9wIGRcblxuXG5hZGRGb290ZXIgPSAoJGNvbnRhaW5lciwgc2VsZWN0b3IsIGFyZykgLT5cbiAgICB7YXV0aG9yLCByZXBvLCBsaW5lLCB1cmx9ID0gYXJnXG4gICAgaWYgYXV0aG9yIGFuZCByZXBvXG4gICAgICAgIGNvbnRlbnQgPSBcIiN7YXV0aG9yfS8je3JlcG99XCJcbiAgICAgICAgIyBuZWVkIHRvIGluamVjdCBicmFuY2ggaW5mb3JtYXRpb24gdG8gc2hvdyBiYWRnZVxuICAgICAgICAjIGJhZGdlID0gXCI8aW1nIGNsYXNzPVxcXCJ0cmF2aXMtYmFkZ2VcXFwiIHNyYz1cXFwiaHR0cHM6Ly9hcGkudHJhdmlzLWNpLm9yZy8je2F1dGhvcn0vI3tyZXBvfS5zdmc/YnJhbmNoPSN7YnJhbmNofVxcXCIgYWx0PVxcXCJzdGF0ZVxcXCIgLz5cIlxuICAgIGVsc2VcbiAgICAgICAgY29udGVudCA9ICdUaGlzIHJlcG9zaXRvcnknXG4gICAgICAgIGJhZGdlID0gJydcbiAgICAjIGNoZWNrIGlmIGxpbmUgaXMgdmFsaWQobm90IGJlIG92ZXIgYWxsIGxpbmUgbGVuZ3RoKVxuICAgIGlmIGxpbmUgYW5kICRjb250YWluZXIuZmluZChcIiN7c2VsZWN0b3J9IHBcIikuZXEobGluZSAtIDEpLmxlbmd0aCA+IDBcbiAgICAgICAgY29udGVudCA9IFwiI3tjb250ZW50fSNMI3tsaW5lfVwiXG4gICAgaWYgdXJsXG4gICAgICAgIGNvbnRlbnQgPSBcIjxhIGNsYXNzPVxcXCJ0cmF2aXMtbGluay10ZXh0XFxcIiBocmVmPVxcXCIje3VybH1cXFwiPiN7Y29udGVudH08L2E+XCJcbiAgICAkY29udGFpbmVyLmFwcGVuZCAkIFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XFxcInRyYXZpcy1sb2ctZm9vdGVyXFxcIj48ZGl2IGNsYXNzPVwidHJhdmlzLWZvb3Rlci10ZXh0XCI+XG4gICAgICAgICN7Y29udGVudH0gYnVpbHQgd2l0aCA8YSBjbGFzcz1cInRyYXZpcy1saW5rLXRleHRcIiBocmVmPVxcXCJodHRwczovL3RyYXZpcy1jaS5vcmdcXFwiPlRyYXZpcyBDSTwvYT4uXG4gICAgPC9kaXY+PC9kaXY+XG4gICAgXCJcIlwiXG5cblxuIyBtYWluIG1vZHVsZVxubWFpbiA9IC0+XG4gICAgJCgnLm9lbWJlZC10cmF2aXMnKS5lYWNoIC0+XG4gICAgICAgICRjb250YWluZXIgPSAkIHRoaXNcbiAgICAgICAgaWYgJGNvbnRhaW5lci5jaGlsZHJlbiA+IDAgdGhlbiByZXR1cm5cbiAgICAgICAgdXJsICAgID0gJGNvbnRhaW5lci5kYXRhICd1cmwnXG4gICAgICAgIGF1dGhvciA9ICRjb250YWluZXIuZGF0YSAnYXV0aG9yJ1xuICAgICAgICByZXBvICAgPSAkY29udGFpbmVyLmRhdGEgJ3JlcG8nXG4gICAgICAgIHR5cGUgICA9IGlmICRjb250YWluZXIuZGF0YSAnYnVpbGRzJyB0aGVuICdidWlsZHMnIGVsc2UgJ2pvYnMnXG4gICAgICAgIGlkICAgICA9ICRjb250YWluZXIuZGF0YSB0eXBlXG4gICAgICAgIGxpbmUgICA9ICRjb250YWluZXIuZGF0YSAnbGluZSdcblxuICAgICAgICBpZiB0eXBlIGlzICdidWlsZHMnXG4gICAgICAgICAgICByZXF1ZXN0T3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vYXBpLnRyYXZpcy1jaS5vcmcvYnVpbGRzLyN7aWR9XCJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOlxuICAgICAgICAgICAgICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi92bmQudHJhdmlzLWNpLjIranNvbidcblxuICAgICAgICAgICAgJC5hamF4IHJlcXVlc3RPcHRpb25zXG4gICAgICAgICAgICAgICAgLnRoZW4gKHtqb2JzfSkgLT5cbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS9hcmNoaXZlLnRyYXZpcy1jaS5vcmcvam9icy8je2pvYnNbMF0uaWR9L2xvZy50eHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBY2NlcHQ6ICd0ZXh0L3BsYWluJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNTAwMFxuXG4gICAgICAgICAgICAgICAgICAgICQuYWpheCByZXF1ZXN0T3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4gKGxpbmVzKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuYXBwZW5kICQgZm9ybWF0TGluZXMgbGluZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRGb2xkTGFiZWwgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHkgcFtkYXRhLWZvbGQtc3RhcnRdJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZFRpbWVMYWJlbCAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keSBwW2RhdGEtdGltZS1zdGFydF0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRm9sZEhhbmRsZXJzICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5IHBbZGF0YS1mb2xkLXN0YXJ0XT5hJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxpbmUgdGhlbiBhY3RpdmF0ZUxpbmUgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHknLCBsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRm9vdGVyICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5Jywge2F1dGhvciwgcmVwbywgbGluZSwgdXJsfVxuXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMgPVxuICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vYXJjaGl2ZS50cmF2aXMtY2kub3JnL2pvYnMvI3tpZH0vbG9nLnR4dFwiXG4gICAgICAgICAgICAgICAgaGVhZGVyczpcbiAgICAgICAgICAgICAgICAgICAgQWNjZXB0OiAndGV4dC9wbGFpbidcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiA1MDAwXG5cblxuICAgICAgICAgICAgJC5hamF4IHJlcXVlc3RPcHRpb25zXG4gICAgICAgICAgICAgICAgLnRoZW4gKGxpbmVzKSAtPlxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmFwcGVuZCAkIGZvcm1hdExpbmVzIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgIGFkZEZvbGRMYWJlbCAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keSBwW2RhdGEtZm9sZC1zdGFydF0nXG4gICAgICAgICAgICAgICAgICAgIGFkZFRpbWVMYWJlbCAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keSBwW2RhdGEtdGltZS1zdGFydF0nXG4gICAgICAgICAgICAgICAgICAgIGFkZEZvbGRIYW5kbGVycyAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keSBwW2RhdGEtZm9sZC1zdGFydF0+YSdcbiAgICAgICAgICAgICAgICAgICAgaWYgbGluZSB0aGVuIGFjdGl2YXRlTGluZSAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keScsIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgYWRkRm9vdGVyICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5Jywge2F1dGhvciwgcmVwbywgbGluZSwgdXJsfVxuXG5cblxuXG4jIGVuZ2luZSBoYW5kbGluZ1xuaWYgbW9kdWxlP1xuICAgICMgZXhwb3J0IGZvciB0ZXN0XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7IHV0aWwsIGFuc2kySHRtbCwgZm9ybWF0TGluZXMgfVxuZWxzZSBpZiB3aW5kb3c/XG4gICAgIyBleGVjIG9uIGJyb3dzZXJcbiAgICAkKGRvY3VtZW50KS5yZWFkeSBtYWluXG4iXX0=
