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
      line = line.replace(/\[\d?K/g, '');
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
    return $container.append($("<div class=\"travis-log-footer\"><h2 class=\"travis-title\">\n    " + content + " build with <a href=\"https://travis-ci.org\">Travis CI</a>.\n</h2></div>"));
  };

  main = function() {
    return $('.oembed-travis').each(function() {
      var $container, author, id, line, repo, requestOptions, type, url;
      $container = $(this);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzL29lbWJlZC10cmF2aXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBO0FBQUEsTUFBQSw4SEFBQTtJQUFBOztFQUFBLElBQUEsR0FDSTtJQUFBLFFBQUEsRUFBVSxTQUFDLElBQUQ7YUFBVSxJQUFJLENBQUMsS0FBTCxDQUFZLElBQUEsR0FBTyxRQUFuQixDQUFBLEdBQStCO0lBQXpDLENBQVY7OztFQUtKLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxTQUFQO0FBQ1IsUUFBQTtJQUFBLElBQUEsR0FBTztJQUNQLEdBQUEsR0FBTSxNQUFNLENBQUMsWUFBUCxDQUFvQixJQUFwQjtJQUNOLEtBQUEsR0FBUTtJQUVSLGFBQUEsR0FBZ0IsU0FBQyxRQUFEO0FBQ1osVUFBQTtNQUFBLElBQU8sZ0JBQVA7QUFBc0IsZUFBTyxHQUE3Qjs7TUFDQSxPQUFBLEdBQVU7QUFDVixXQUFBLGVBQUE7O1FBQ0ksSUFBRyxhQUFIO1VBQWUsT0FBTyxDQUFDLElBQVIsQ0FBZ0IsR0FBRCxHQUFLLEdBQUwsR0FBUSxLQUF2QixFQUFmOztBQURKO0FBRUEsYUFBTyxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWI7SUFMSztJQU9oQixRQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsRUFBUixFQUFZLEVBQVosRUFBZ0IsRUFBaEI7QUFDUCxVQUFBO01BQUEsSUFBRyxHQUFBLEtBQVMsRUFBWjtBQUFvQixlQUFPLE1BQTNCOztNQUNBLElBQUcsQ0FBQyxFQUFBLEtBQU0sRUFBUCxDQUFBLElBQWMsQ0FBQyxJQUFBLEtBQVEsRUFBVCxDQUFqQjtRQUFtQyxFQUFBLEdBQUssSUFBeEM7O01BQ0EsR0FBQSxHQUFNO0FBQ04sV0FBUywrRkFBVDtRQUNJLElBQUEsR0FBTyxRQUFBLENBQVMsU0FBVSxDQUFBLENBQUEsQ0FBbkIsQ0FBc0IsQ0FBQyxRQUF2QixDQUFBO1FBQ1AsSUFBRyxhQUFRLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBWixDQUFSLEVBQUEsSUFBQSxNQUFI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LFlBQUEsQ0FBYSxVQUFiLEVBQXlCLHFDQUF6QjtVQUNBLGVBQUEsQ0FBZ0IsVUFBaEIsRUFBNEIsdUNBQTVCO1VBQ0EsSUFBRyxJQUFIO1lBQWEsWUFBQSxDQUFhLFVBQWIsRUFBeUIsa0JBQXpCLEVBQTZDLElBQTdDLEVBQWI7O2lCQUNBLFNBQUEsQ0FBVSxVQUFWLEVBQXNCLGtCQUF0QixFQUEwQztZQUFDLFFBQUEsTUFBRDtZQUFTLE1BQUEsSUFBVDtZQUFlLE1BQUEsSUFBZjtZQUFxQixLQUFBLEdBQXJCO1dBQTFDO1FBTkUsQ0FEVixFQWhDSjs7SUFUcUIsQ0FBekI7RUFERzs7RUF3RFAsSUFBRyxnREFBSDtJQUVJLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO01BQUUsTUFBQSxJQUFGO01BQVEsV0FBQSxTQUFSO01BQW1CLGFBQUEsV0FBbkI7TUFGckI7R0FBQSxNQUdLLElBQUcsZ0RBQUg7SUFFRCxDQUFBLENBQUUsUUFBRixDQUFXLENBQUMsS0FBWixDQUFrQixJQUFsQixFQUZDOztBQXZPTCIsImZpbGUiOiJqcy9vZW1iZWQtdHJhdmlzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiI1xuIyBzb21lIHV0aWxpdGllc1xuI1xudXRpbCA9XG4gICAgbnNlYzJzZWM6IChuc2VjKSAtPiBNYXRoLnJvdW5kKCBuc2VjIC8gMTAwMDAwMDApIC8gMTAwXG5cbiNcbiMgdGVybWluYWwgY29kZXMgdG8gSHRtbFxuI1xuYW5zaTJIdG1sID0gKGxpbmUsIHN0eWxlU2V0cykgLT5cbiAgICBhbnNpID0gLyguKVxcWyhcXGQrOyk/KFxcZCspKm0vZ1xuICAgIEVTQyA9IFN0cmluZy5mcm9tQ2hhckNvZGUgJzI3J1xuICAgIHN0YWNrID0gJydcblxuICAgIGdldFN0eWxlVmFsdWUgPSAoc3R5bGVTZXQpIC0+XG4gICAgICAgIHVubGVzcyBzdHlsZVNldD8gdGhlbiByZXR1cm4gJydcbiAgICAgICAgcmVzdWx0cyA9IFtdXG4gICAgICAgIGZvciBrZXksIHZhbHVlIG9mIHN0eWxlU2V0XG4gICAgICAgICAgICBpZiB2YWx1ZT8gdGhlbiByZXN1bHRzLnB1c2ggXCIje2tleX06I3t2YWx1ZX1cIlxuICAgICAgICByZXR1cm4gcmVzdWx0cy5qb2luICc7J1xuXG4gICAgY2FsbGJhY2sgPSAobWF0Y2gsIGIwLCBiMSwgYjIpIC0+XG4gICAgICAgIGlmIEVTQyBpc250IGIwIHRoZW4gcmV0dXJuIG1hdGNoXG4gICAgICAgIGlmICgnJyBpcyBiMikgb3IgKG51bGwgaXMgYjIpIHRoZW4gYjIgPSAnMCdcbiAgICAgICAgcmVzID0gJydcbiAgICAgICAgZm9yIGkgaW4gWzIuLihhcmd1bWVudHMubGVuZ3RoIC0gMyldICNleGNsdWRlICdvZmZzZXQnIGFuZCAnc3RyaW5nJyBhcmd1bWVudHNcbiAgICAgICAgICAgIGNvZGUgPSBwYXJzZUludChhcmd1bWVudHNbaV0pLnRvU3RyaW5nKClcbiAgICAgICAgICAgIGlmIGNvZGUgaW4gT2JqZWN0LmtleXMgc3R5bGVTZXRzXG4gICAgICAgICAgICAgICAgc3RhY2sgKz0gJzwvc3Bhbj4nXG4gICAgICAgICAgICAgICAgcmVzICs9ICc8c3BhbiBzdHlsZT1cIicgKyBnZXRTdHlsZVZhbHVlKHN0eWxlU2V0c1tjb2RlXSkgKyAnXCI+J1xuICAgICAgICByZXR1cm4gcmVzXG5cbiAgICByZXR1cm4gKGxpbmUucmVwbGFjZSBhbnNpLCBjYWxsYmFjaykgKyBzdGFja1xuXG4jXG4jIGRldGVjdCB0cmF2aXMgY29udHJvbCBjb2RlXG4jXG5mb3JtYXRMaW5lcyA9IChsaW5lcykgLT5cbiAgICBpZiB0eXBlb2YgbGluZXMgaXMgJ3N0cmluZycgdGhlbiBsaW5lcyA9IGxpbmVzLnNwbGl0ICdcXG4nXG4gICAgaHRtbCA9ICcnXG4gICAgRVNDID0gU3RyaW5nLmZyb21DaGFyQ29kZSAyN1xuICAgIENSID0gU3RyaW5nLmZyb21DaGFyQ29kZSAxM1xuICAgIGZvciBsaW5lLCBpbmRleCBpbiBsaW5lc1xuICAgICAgICBhdHRyID0gJydcbiAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSAvdHJhdmlzXyhmb2xkfHRpbWUpOihzdGFydHxlbmQpOiguKykvZywgKG1hdGNoLCBwMSwgcDIsIHAzKSAtPlxuICAgICAgICAgICAgaWYgcDE/IGFuZCBwMj9cbiAgICAgICAgICAgICAgICBhdHRyICs9IFwiIGRhdGEtI3twMX0tI3twMn09XFxcIiN7cDN9XFxcIlwiXG4gICAgICAgICAgICByZXR1cm4gJydcblxuICAgICAgICBsaW5lID0gYW5zaTJIdG1sIGxpbmUsIHN0eWxlU2V0c1xuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlIG5ldyBSZWdFeHAoQ1IsJ2cnKSwgJydcbiAgICAgICAgbGluZSA9IGxpbmUucmVwbGFjZSBuZXcgUmVnRXhwKEVTQywnZycpLCAnJ1xuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlIC9cXFtcXGQ/Sy9nLCAnJ1xuXG4gICAgICAgIGh0bWwgKz0gXCI8cCN7YXR0cn0+PGE+I3tpbmRleCArIDF9PC9hPiN7bGluZX08L3A+XCJcblxuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcInRyYXZpcy1sb2ctYm9keVxcXCI+PGRpdiBjbGFzcz1cXFwidHJhdmlzLXByZVxcXCI+I3todG1sfTwvZGl2PjwvZGl2PlwiXG5cbiNcbiMgZGVmaW5lIHRlcm1pbmFsIGNvZGUgc3R5bGVzXG4jXG5zdHlsZVNldHMgPVxuICAgIDA6ICB7ICdmb250LXdlaWdodCc6ICdub3JtYWwnLCAnZm9udC1zdHlsZSc6ICdub3JtYWwnLCAndGV4dC1kZWNvcmF0aW9uJzogJ25vbmUnLCdiYWNrZ3JvdW5kLWNvbG9yJzogJyMyMjInLCBjb2xvcjogJyNmMWYxZjEnIH1cbiAgICAxOiAgeyAnZm9udC13ZWlnaHQnOiAnYm9sZCcgfVxuICAgIDM6ICB7ICdmb250LXN0eWxlJzogJ2l0YWxpYycgfVxuICAgIDQ6ICB7ICd0ZXh0LWRlY29yYXRpb24nOiAndW5kZXJsaW5lJyB9XG4gICAgNTogIHsgJ2FuaW1hdGlvbic6ICdibGluayAxcyBzdGVwLWVuZCBpbmZpbml0ZScsICctd2Via2l0LWFuaW1hdGlvbic6ICdibGluayAxcyBzdGVwLWVuZCBpbmZpbml0ZScgfVxuICAgIDc6ICB7IGludmVydDogdHJ1ZSB9XG4gICAgOTogIHsgJ3RleHQtZGVjb3JhdGlvbic6ICdsaW5lLXRocm91Z2gnIH1cbiAgICAyMzogeyAnZm9udC1zdHlsZSc6ICdub3JtYWwnIH1cbiAgICAyNDogeyAndGV4dC1kZWNvcmF0aW9uJzogJ25vbmUnIH1cbiAgICAyNTogeyAnYW5pbWF0aW9uJzogJ25vbmUnLCAnLXdlYmtpdC1hbmltYXRpb24nOiAnbm9uZScgfVxuICAgIDI3OiB7IGludmVydDogZmFsc2UgfVxuICAgIDI5OiB7ICd0ZXh0LWRlY29yYXRpb24nOiAnbm9uZScgfVxuICAgIDMwOiB7IGNvbG9yOiAnIzRFNEU0RScgfSAjIGJsYWNrXG4gICAgMzE6IHsgY29sb3I6ICcjRkY5QjkzJyB9ICMgcmVkXG4gICAgMzI6IHsgY29sb3I6ICcjQjFGRDc5JyB9ICMgZ3JlZW5cbiAgICAzMzogeyBjb2xvcjogJyNGRkZGQjYnIH0gIyB5ZWxsb3dcbiAgICAzNDogeyBjb2xvcjogJyNCNURDRkUnIH0gIyBibHVlXG4gICAgMzU6IHsgY29sb3I6ICcjRkY3M0ZEJyB9ICMgbWFnZW10YVxuICAgIDM2OiB7IGNvbG9yOiAnI0UwRkZGRicgfSAjIGN5YW5cbiAgICAzNzogeyBjb2xvcjogJyNmMWYxZjEnIH0gIyB3aGl0ZVxuICAgIDM5OiB7IGNvbG9yOiAnI2YxZjFmMScgfSAjZGVmYXVsdFxuICAgIDQwOiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyM0RTRFNEUnIH0gIyBibGFja1xuICAgIDQxOiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGRjlCOTMnIH0gIyByZWRcbiAgICA0MjogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjQjFGRDc5JyB9ICMgZ3JlZW5cbiAgICA0MzogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjRkZGRkI2JyB9ICMgeWVsbG93XG4gICAgNDQ6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI0I1RENGRScgfSAjIGJsdWVcbiAgICA0NTogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjRkY3M0ZEJyB9ICMgbWFnZW10YVxuICAgIDQ2OiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNFMEZGRkYnIH0gIyBjeWFuXG4gICAgNDc6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI2YxZjFmMScgfSAjIHdoaXRlXG4gICAgNDk6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnIzIyMicgfSAjIGRlZmF1bHRcblxuXG5cbmlmIHdpbmRvdz8gdGhlbiAkID0galF1ZXJ5XG5cbmFkZEZvbGRMYWJlbCA9ICgkY29udGFpbmVyLCBzZWxlY3RvcikgLT5cbiAgICAkY29udGFpbmVyLmZpbmQoc2VsZWN0b3IpLmVhY2ggLT5cbiAgICAgICAgJCh0aGlzKS5wcmVwZW5kICQgJzxzcGFuIGNsYXNzPVwidHJhdmlzLWluZm8gdHJhdmlzLWZvbGQtc3RhcnRcIj4nICsgKCQodGhpcykuZGF0YSAnZm9sZC1zdGFydCcpICsgJzwvc3Bhbj4nXG5cblxuYWRkVGltZUxhYmVsID0gKCRjb250YWluZXIsIHNlbGVjdG9yKSAtPlxuICAgICRjb250YWluZXIuZmluZChzZWxlY3RvcikuZWFjaCAtPlxuICAgICAgICAkbiA9ICQodGhpcylcbiAgICAgICAgdW50aWwgKCRuLmRhdGEgJ3RpbWUtZW5kJykgb3IgKCRuLmxlbmd0aCBpcyAwKVxuICAgICAgICAgICAgJG4gPSAkbi5uZXh0KClcbiAgICAgICAgaWYgJG4uZGF0YSgndGltZS1lbmQnKVxuICAgICAgICAgICAgZHVyYXRpb24gPSB1dGlsLm5zZWMyc2VjICgnJykgKyAkbi5kYXRhKCd0aW1lLWVuZCcpLm1hdGNoKC9kdXJhdGlvbj0oXFxkKikkLylbMV1cbiAgICAgICAgICAgIGlmIGR1cmF0aW9uIHRoZW4gJCh0aGlzKS5wcmVwZW5kICQgXCI8c3BhbiBjbGFzcz1cXFwidHJhdmlzLWluZm8gdHJhdmlzLXRpbWUtc3RhcnRcXFwiPiN7ZHVyYXRpb259czwvc3Bhbj5cIlxuXG5cblxudG9nZ2xlID0gKCRoYW5kbGUsIGJvb2wpIC0+XG4gICAgW29wZW5lZCwgY2xvc2VkXSA9IFsndHJhdmlzLWZvbGQtY2xvc2UnLCAndHJhdmlzLWZvbGQtb3BlbiddXG4gICAgJGhhbmRsZS5yZW1vdmVDbGFzcyhpZiBib29sIHRoZW4gY2xvc2VkIGVsc2Ugb3BlbmVkKVxuICAgICRoYW5kbGUuYWRkQ2xhc3MoaWYgYm9vbCB0aGVuIG9wZW5lZCBlbHNlIGNsb3NlZClcbiAgICAkbiA9ICRoYW5kbGUubmV4dCgpXG4gICAgbGFiZWwgPSAkaGFuZGxlLmRhdGEgJ2ZvbGQtc3RhcnQnXG4gICAgdW50aWwgKGxhYmVsIGlzICRuLmRhdGEgJ2ZvbGQtZW5kJykgb3IgKCRuLmRhdGEgJ2ZvbGQtc3RhcnQnKT8gb3IgKCRuLmxlbmd0aCBpcyAwKVxuICAgICAgICAkbltpZiBib29sIHRoZW4gJ3Nob3cnIGVsc2UgJ2hpZGUnXSgpXG4gICAgICAgICRuID0gJG4ubmV4dCgpXG5cblxuYWRkRm9sZEhhbmRsZXJzID0gKCRjb250YWluZXIsIHNlbGVjdG9yKSAtPlxuICAgIFtvcGVuZWQsIGNsb3NlZF0gPSBbJ3RyYXZpcy1mb2xkLWNsb3NlJywgJ3RyYXZpcy1mb2xkLW9wZW4nXVxuICAgICRjb250YWluZXIuZmluZChzZWxlY3RvcilcbiAgICAgICAgLmFkZENsYXNzIGNsb3NlZFxuICAgICAgICAuZWFjaCAtPlxuICAgICAgICAgICAgdG9nZ2xlKCQodGhpcykucGFyZW50KCksIGZhbHNlKVxuICAgICAgICAgICAgJCh0aGlzKS5jbGljayAtPlxuICAgICAgICAgICAgICAgICAgICAkcCA9ICQodGhpcykucGFyZW50KClcbiAgICAgICAgICAgICAgICAgICAgaWYgJHAuaGFzQ2xhc3Mgb3BlbmVkIHRoZW4gdG9nZ2xlKCRwLCBmYWxzZSkgZWxzZSB0b2dnbGUoJHAsIHRydWUpXG5cblxuYWN0aXZhdGVMaW5lID0gKCRjb250YWluZXIsIHNlbGVjdG9yLCBsaW5lKSAtPlxuICAgICRwcmUgPSAkY29udGFpbmVyLmZpbmQoXCIje3NlbGVjdG9yfSAudHJhdmlzLXByZVwiKVxuICAgICRwICAgPSAkY29udGFpbmVyLmZpbmQoXCIje3NlbGVjdG9yfSBwXCIpLmVxKGxpbmUgLSAxKVxuICAgIGlmICRwLmxlbmd0aCBpcyAwIHRoZW4gcmV0dXJuXG4gICAgJHAuYWRkQ2xhc3MgJ3RyYXZpcy1naXZlbi1hY3RpdmUtbGluZSdcbiAgICBpZiAkcC5jc3MoJ2Rpc3BsYXknKSBpcyAnbm9uZSdcbiAgICAgICAgJHBvaW50ZXIgPSAkcFxuICAgICAgICB1bnRpbCAoJHBvaW50ZXIuZGF0YSAnZm9sZC1zdGFydCcpIG9yICgkcG9pbnRlci5sZW5ndGggaXMgMClcbiAgICAgICAgICAgICRwb2ludGVyID0gJHBvaW50ZXIucHJldigpXG4gICAgICAgIHRvZ2dsZSgkcG9pbnRlciwgdHJ1ZSlcbiAgICBib2R5SGVpZ2h0ID0gJHByZS5oZWlnaHQoKVxuICAgIGxpbmVUb3AgICAgPSAkcC5wb3NpdGlvbigpLnRvcCAtICRwcmUucG9zaXRpb24oKS50b3BcbiAgICBsaW5lSGVpZ2h0ID0gJHAuaGVpZ2h0KClcbiAgICBkID0gbGluZVRvcCAtIChib2R5SGVpZ2h0IC8gMikgKyAobGluZUhlaWdodCAvIDIpXG4gICAgJHByZS5zY3JvbGxUb3AgZFxuXG5cbmFkZEZvb3RlciA9ICgkY29udGFpbmVyLCBzZWxlY3RvciwgYXJnKSAtPlxuICAgIHthdXRob3IsIHJlcG8sIGxpbmUsIHVybH0gPSBhcmdcbiAgICBpZiBhdXRob3IgYW5kIHJlcG9cbiAgICAgICAgY29udGVudCA9IFwiI3thdXRob3J9LyN7cmVwb31cIlxuICAgICAgICAjIG5lZWQgdG8gYmUgaW5qZWN0IGJyYW5jaCBpbmZvcm1hdGlvbiB0byBzaG93IGJhZGdlXG4gICAgICAgICMgYmFkZ2UgPSBcIjxpbWcgY2xhc3M9XFxcInRyYXZpcy1iYWRnZVxcXCIgc3JjPVxcXCJodHRwczovL2FwaS50cmF2aXMtY2kub3JnLyN7YXV0aG9yfS8je3JlcG99LnN2Zz9icmFuY2g9I3ticmFuY2h9XFxcIiBhbHQ9XFxcInN0YXRlXFxcIiAvPlwiXG4gICAgZWxzZVxuICAgICAgICBjb250ZW50ID0gJ1RoaXMgcmVwb3NpdG9yeSdcbiAgICAgICAgYmFkZ2UgPSAnJ1xuICAgICMgaWYgbGluZSBpcyB2YWxpZChub3QgYmUgb3ZlciBhbGwgbGluZSBsZW5ndGgpXG4gICAgaWYgbGluZSBhbmQgJGNvbnRhaW5lci5maW5kKFwiI3tzZWxlY3Rvcn0gcFwiKS5lcShsaW5lIC0gMSkubGVuZ3RoID4gMFxuICAgICAgICBjb250ZW50ID0gXCIje2NvbnRlbnR9I0wje2xpbmV9XCJcbiAgICBpZiB1cmxcbiAgICAgICAgY29udGVudCA9IFwiPGEgaHJlZj1cXFwiI3t1cmx9XFxcIj4je2NvbnRlbnR9PC9hPlwiXG4gICAgJGNvbnRhaW5lci5hcHBlbmQgJCBcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPVxcXCJ0cmF2aXMtbG9nLWZvb3RlclxcXCI+PGgyIGNsYXNzPVwidHJhdmlzLXRpdGxlXCI+XG4gICAgICAgICN7Y29udGVudH0gYnVpbGQgd2l0aCA8YSBocmVmPVxcXCJodHRwczovL3RyYXZpcy1jaS5vcmdcXFwiPlRyYXZpcyBDSTwvYT4uXG4gICAgPC9oMj48L2Rpdj5cbiAgICBcIlwiXCJcblxuI1xuIyBtYWluIG1vZHVsZVxuI1xubWFpbiA9IC0+XG4gICAgJCgnLm9lbWJlZC10cmF2aXMnKS5lYWNoIC0+XG4gICAgICAgICRjb250YWluZXIgPSAkIHRoaXNcbiAgICAgICAgdXJsICAgID0gJGNvbnRhaW5lci5kYXRhICd1cmwnXG4gICAgICAgIGF1dGhvciA9ICRjb250YWluZXIuZGF0YSAnYXV0aG9yJ1xuICAgICAgICByZXBvICAgPSAkY29udGFpbmVyLmRhdGEgJ3JlcG8nXG4gICAgICAgIHR5cGUgICA9IGlmICRjb250YWluZXIuZGF0YSAnYnVpbGRzJyB0aGVuICdidWlsZHMnIGVsc2UgJ2pvYnMnXG4gICAgICAgIGlkICAgICA9ICRjb250YWluZXIuZGF0YSB0eXBlXG4gICAgICAgIGxpbmUgICA9ICRjb250YWluZXIuZGF0YSAnbGluZSdcblxuICAgICAgICBpZiB0eXBlIGlzICdidWlsZHMnXG4gICAgICAgICAgICByZXF1ZXN0T3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vYXBpLnRyYXZpcy1jaS5vcmcvYnVpbGRzLyN7aWR9XCJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOlxuICAgICAgICAgICAgICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi92bmQudHJhdmlzLWNpLjIranNvbidcblxuICAgICAgICAgICAgJC5hamF4IHJlcXVlc3RPcHRpb25zXG4gICAgICAgICAgICAgICAgLnRoZW4gKHtqb2JzfSkgLT5cbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS9hcmNoaXZlLnRyYXZpcy1jaS5vcmcvam9icy8je2pvYnNbMF0uaWR9L2xvZy50eHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBY2NlcHQ6ICd0ZXh0L3BsYWluJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogNTAwMFxuXG4gICAgICAgICAgICAgICAgICAgICQuYWpheCByZXF1ZXN0T3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4gKGxpbmVzKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuYXBwZW5kICQgZm9ybWF0TGluZXMobGluZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRm9sZExhYmVsICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5IHBbZGF0YS1mb2xkLXN0YXJ0XSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRUaW1lTGFiZWwgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHkgcFtkYXRhLXRpbWUtc3RhcnRdJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZEZvbGRIYW5kbGVycyAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keSBwW2RhdGEtZm9sZC1zdGFydF0+YSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBsaW5lIHRoZW4gYWN0aXZhdGVMaW5lICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5JywgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZEZvb3RlciAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keScsIHthdXRob3IsIHJlcG8sIGxpbmUsIHVybH1cblxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zID1cbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2FyY2hpdmUudHJhdmlzLWNpLm9yZy9qb2JzLyN7aWR9L2xvZy50eHRcIlxuICAgICAgICAgICAgICAgIGhlYWRlcnM6XG4gICAgICAgICAgICAgICAgICAgIEFjY2VwdDogJ3RleHQvcGxhaW4nXG4gICAgICAgICAgICAgICAgdGltZW91dDogNTAwMFxuXG5cbiAgICAgICAgICAgICQuYWpheCByZXF1ZXN0T3B0aW9uc1xuICAgICAgICAgICAgICAgIC50aGVuIChsaW5lcykgLT5cbiAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5hcHBlbmQgJCBmb3JtYXRMaW5lcyhsaW5lcylcbiAgICAgICAgICAgICAgICAgICAgYWRkRm9sZExhYmVsICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5IHBbZGF0YS1mb2xkLXN0YXJ0XSdcbiAgICAgICAgICAgICAgICAgICAgYWRkVGltZUxhYmVsICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5IHBbZGF0YS10aW1lLXN0YXJ0XSdcbiAgICAgICAgICAgICAgICAgICAgYWRkRm9sZEhhbmRsZXJzICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5IHBbZGF0YS1mb2xkLXN0YXJ0XT5hJ1xuICAgICAgICAgICAgICAgICAgICBpZiBsaW5lIHRoZW4gYWN0aXZhdGVMaW5lICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5JywgbGluZVxuICAgICAgICAgICAgICAgICAgICBhZGRGb290ZXIgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHknLCB7YXV0aG9yLCByZXBvLCBsaW5lLCB1cmx9XG5cblxuXG4jXG4jIGVuZ2luZSBoYW5kbGluZ1xuI1xuaWYgbW9kdWxlP1xuICAgICMgZXhwb3J0IGZvciB0ZXN0XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7IHV0aWwsIGFuc2kySHRtbCwgZm9ybWF0TGluZXMgfVxuZWxzZSBpZiB3aW5kb3c/XG4gICAgIyBleGVjIG9uIGJyb3dzZXJcbiAgICAkKGRvY3VtZW50KS5yZWFkeSBtYWluXG4iXX0=
