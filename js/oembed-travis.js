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
      var $paragraph, duration;
      $paragraph = $(this);
      while (!$paragraph.data('time-end')) {
        $paragraph = $paragraph.next();
      }
      duration = util.nsec2sec($paragraph.data('time-end').match(/duration=(\d*)$/)[1]);
      return $(this).prepend($("<span class=\"travis-info travis-time-start\">" + duration + "s</span>"));
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
    while (!((label === $n.data('fold-end')) || (($n.data('fold-start')) != null))) {
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
    $pre = $container.find(selector + " pre");
    $p = $container.find(selector + " p").eq(line - 1);
    $p.addClass('travis-given-active-line');
    if ($p.css('display') === 'none') {
      $pointer = $p;
      while (!$pointer.data('fold-start')) {
        $pointer = $pointer.prev();
      }
      toggle($pointer, true);
    }
    bodyHeight = $pre.height();
    lineTop = $p.position().top;
    lineHeight = $p.height();
    d = lineTop - (bodyHeight / 2) + (lineHeight / 2);
    return $pre.scrollTop(d);
  };

  addFooter = function($container, arg) {
    var author, badge, content, line, repo, url;
    author = arg.author, repo = arg.repo, line = arg.line, url = arg.url;
    if (author && repo) {
      content = author + "/" + repo;
    } else {
      content = 'This repository';
      badge = '';
    }
    if (line) {
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
            }
          };
          return $.ajax(requestOptions).then(function(lines) {
            $container.append($(formatLines(lines)));
            addFoldLabel($container, '.travis-log-body p[data-fold-start]');
            addTimeLabel($container, '.travis-log-body p[data-time-start]');
            addFoldHandlers($container, '.travis-log-body p[data-fold-start]>a');
            if (line) {
              activateLine($container, '.travis-log-body', line);
            }
            return addFooter($container, {
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
          }
        };
        return $.ajax(requestOptions).then(function(lines) {
          $container.append($(formatLines(lines)));
          addFoldLabel($container, '.travis-log-body p[data-fold-start]');
          addTimeLabel($container, '.travis-log-body p[data-time-start]');
          addFoldHandlers($container, '.travis-log-body p[data-fold-start]>a');
          if (line) {
            activateLine($container, '.travis-log-body', line);
          }
          return addFooter($container, {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzL29lbWJlZC10cmF2aXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBO0FBQUEsTUFBQSw4SEFBQTtJQUFBOztFQUFBLElBQUEsR0FDSTtJQUFBLFFBQUEsRUFBVSxTQUFDLElBQUQ7YUFBVSxJQUFJLENBQUMsS0FBTCxDQUFZLElBQUEsR0FBTyxRQUFuQixDQUFBLEdBQStCO0lBQXpDLENBQVY7OztFQUtKLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxTQUFQO0FBQ1IsUUFBQTtJQUFBLElBQUEsR0FBTztJQUNQLEdBQUEsR0FBTSxNQUFNLENBQUMsWUFBUCxDQUFvQixJQUFwQjtJQUNOLEtBQUEsR0FBUTtJQUVSLGFBQUEsR0FBZ0IsU0FBQyxRQUFEO0FBQ1osVUFBQTtNQUFBLElBQU8sZ0JBQVA7QUFBc0IsZUFBTyxHQUE3Qjs7TUFDQSxPQUFBLEdBQVU7QUFDVixXQUFBLGVBQUE7O1FBQ0ksSUFBRyxhQUFIO1VBQWUsT0FBTyxDQUFDLElBQVIsQ0FBZ0IsR0FBRCxHQUFLLEdBQUwsR0FBUSxLQUF2QixFQUFmOztBQURKO0FBRUEsYUFBTyxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWI7SUFMSztJQU9oQixRQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsRUFBUixFQUFZLEVBQVosRUFBZ0IsRUFBaEI7QUFDUCxVQUFBO01BQUEsSUFBRyxHQUFBLEtBQVMsRUFBWjtBQUFvQixlQUFPLE1BQTNCOztNQUNBLElBQUcsQ0FBQyxFQUFBLEtBQU0sRUFBUCxDQUFBLElBQWMsQ0FBQyxJQUFBLEtBQVEsRUFBVCxDQUFqQjtRQUFtQyxFQUFBLEdBQUssSUFBeEM7O01BQ0EsR0FBQSxHQUFNO0FBQ04sV0FBUywrRkFBVDtRQUNJLElBQUEsR0FBTyxRQUFBLENBQVMsU0FBVSxDQUFBLENBQUEsQ0FBbkIsQ0FBc0IsQ0FBQyxRQUF2QixDQUFBO1FBQ1AsSUFBRyxhQUFRLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBWixDQUFSLEVBQUEsSUFBQSxNQUFIO1VBQ0ksS0FBQSxJQUFTO1VBQ1QsR0FBQSxJQUFPLGVBQUEsR0FBa0IsYUFBQSxDQUFjLFNBQVUsQ0FBQSxJQUFBLENBQXhCLENBQWxCLEdBQW1ELEtBRjlEOztBQUZKO0FBS0EsYUFBTztJQVRBO0FBV1gsV0FBTyxDQUFDLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBYixFQUFtQixRQUFuQixDQUFELENBQUEsR0FBZ0M7RUF2Qi9COztFQTRCWixXQUFBLEdBQWMsU0FBQyxLQUFEO0FBQ1YsUUFBQTtJQUFBLElBQUcsT0FBTyxLQUFQLEtBQWdCLFFBQW5CO01BQWlDLEtBQUEsR0FBUSxLQUFLLENBQUMsS0FBTixDQUFZLElBQVosRUFBekM7O0lBQ0EsSUFBQSxHQUFPO0lBQ1AsR0FBQSxHQUFNLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEVBQXBCO0lBQ04sRUFBQSxHQUFLLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEVBQXBCO0FBQ0wsU0FBQSx1REFBQTs7TUFDSSxJQUFBLEdBQU87TUFDUCxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxzQ0FBYixFQUFxRCxTQUFDLEtBQUQsRUFBUSxFQUFSLEVBQVksRUFBWixFQUFnQixFQUFoQjtRQUN4RCxJQUFHLFlBQUEsSUFBUSxZQUFYO1VBQ0ksSUFBQSxJQUFRLFFBQUEsR0FBUyxFQUFULEdBQVksR0FBWixHQUFlLEVBQWYsR0FBa0IsS0FBbEIsR0FBdUIsRUFBdkIsR0FBMEIsS0FEdEM7O0FBRUEsZUFBTztNQUhpRCxDQUFyRDtNQUtQLElBQUEsR0FBTyxTQUFBLENBQVUsSUFBVixFQUFnQixTQUFoQjtNQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFpQixJQUFBLE1BQUEsQ0FBTyxFQUFQLEVBQVUsR0FBVixDQUFqQixFQUFpQyxFQUFqQztNQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFpQixJQUFBLE1BQUEsQ0FBTyxHQUFQLEVBQVcsR0FBWCxDQUFqQixFQUFrQyxFQUFsQztNQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsRUFBeEI7TUFFUCxJQUFBLElBQVEsSUFBQSxHQUFLLElBQUwsR0FBVSxNQUFWLEdBQWUsQ0FBQyxLQUFBLEdBQVEsQ0FBVCxDQUFmLEdBQTBCLE1BQTFCLEdBQWdDLElBQWhDLEdBQXFDO0FBWmpEO0FBY0EsV0FBTywyREFBQSxHQUE0RCxJQUE1RCxHQUFpRTtFQW5COUQ7O0VBd0JkLFNBQUEsR0FDSTtJQUFBLENBQUEsRUFBSTtNQUFFLGFBQUEsRUFBZSxRQUFqQjtNQUEyQixZQUFBLEVBQWMsUUFBekM7TUFBbUQsaUJBQUEsRUFBbUIsTUFBdEU7TUFBNkUsa0JBQUEsRUFBb0IsTUFBakc7TUFBeUcsS0FBQSxFQUFPLFNBQWhIO0tBQUo7SUFDQSxDQUFBLEVBQUk7TUFBRSxhQUFBLEVBQWUsTUFBakI7S0FESjtJQUVBLENBQUEsRUFBSTtNQUFFLFlBQUEsRUFBYyxRQUFoQjtLQUZKO0lBR0EsQ0FBQSxFQUFJO01BQUUsaUJBQUEsRUFBbUIsV0FBckI7S0FISjtJQUlBLENBQUEsRUFBSTtNQUFFLFdBQUEsRUFBYSw0QkFBZjtNQUE2QyxtQkFBQSxFQUFxQiw0QkFBbEU7S0FKSjtJQUtBLENBQUEsRUFBSTtNQUFFLE1BQUEsRUFBUSxJQUFWO0tBTEo7SUFNQSxDQUFBLEVBQUk7TUFBRSxpQkFBQSxFQUFtQixjQUFyQjtLQU5KO0lBT0EsRUFBQSxFQUFJO01BQUUsWUFBQSxFQUFjLFFBQWhCO0tBUEo7SUFRQSxFQUFBLEVBQUk7TUFBRSxpQkFBQSxFQUFtQixNQUFyQjtLQVJKO0lBU0EsRUFBQSxFQUFJO01BQUUsV0FBQSxFQUFhLE1BQWY7TUFBdUIsbUJBQUEsRUFBcUIsTUFBNUM7S0FUSjtJQVVBLEVBQUEsRUFBSTtNQUFFLE1BQUEsRUFBUSxLQUFWO0tBVko7SUFXQSxFQUFBLEVBQUk7TUFBRSxpQkFBQSxFQUFtQixNQUFyQjtLQVhKO0lBWUEsRUFBQSxFQUFJO01BQUUsS0FBQSxFQUFPLFNBQVQ7S0FaSjtJQWFBLEVBQUEsRUFBSTtNQUFFLEtBQUEsRUFBTyxTQUFUO0tBYko7SUFjQSxFQUFBLEVBQUk7TUFBRSxLQUFBLEVBQU8sU0FBVDtLQWRKO0lBZUEsRUFBQSxFQUFJO01BQUUsS0FBQSxFQUFPLFNBQVQ7S0FmSjtJQWdCQSxFQUFBLEVBQUk7TUFBRSxLQUFBLEVBQU8sU0FBVDtLQWhCSjtJQWlCQSxFQUFBLEVBQUk7TUFBRSxLQUFBLEVBQU8sU0FBVDtLQWpCSjtJQWtCQSxFQUFBLEVBQUk7TUFBRSxLQUFBLEVBQU8sU0FBVDtLQWxCSjtJQW1CQSxFQUFBLEVBQUk7TUFBRSxLQUFBLEVBQU8sU0FBVDtLQW5CSjtJQW9CQSxFQUFBLEVBQUk7TUFBRSxLQUFBLEVBQU8sU0FBVDtLQXBCSjtJQXFCQSxFQUFBLEVBQUk7TUFBRSxrQkFBQSxFQUFvQixTQUF0QjtLQXJCSjtJQXNCQSxFQUFBLEVBQUk7TUFBRSxrQkFBQSxFQUFvQixTQUF0QjtLQXRCSjtJQXVCQSxFQUFBLEVBQUk7TUFBRSxrQkFBQSxFQUFvQixTQUF0QjtLQXZCSjtJQXdCQSxFQUFBLEVBQUk7TUFBRSxrQkFBQSxFQUFvQixTQUF0QjtLQXhCSjtJQXlCQSxFQUFBLEVBQUk7TUFBRSxrQkFBQSxFQUFvQixTQUF0QjtLQXpCSjtJQTBCQSxFQUFBLEVBQUk7TUFBRSxrQkFBQSxFQUFvQixTQUF0QjtLQTFCSjtJQTJCQSxFQUFBLEVBQUk7TUFBRSxrQkFBQSxFQUFvQixTQUF0QjtLQTNCSjtJQTRCQSxFQUFBLEVBQUk7TUFBRSxrQkFBQSxFQUFvQixTQUF0QjtLQTVCSjtJQTZCQSxFQUFBLEVBQUk7TUFBRSxrQkFBQSxFQUFvQixNQUF0QjtLQTdCSjs7O0VBaUNKLElBQUcsZ0RBQUg7SUFBZ0IsQ0FBQSxHQUFJLE9BQXBCOzs7RUFFQSxZQUFBLEdBQWUsU0FBQyxVQUFELEVBQWEsUUFBYjtXQUNYLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFFBQWhCLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsU0FBQTthQUMzQixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsT0FBUixDQUFnQixDQUFBLENBQUUsOENBQUEsR0FBaUQsQ0FBQyxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLFlBQWIsQ0FBRCxDQUFqRCxHQUErRSxTQUFqRixDQUFoQjtJQUQyQixDQUEvQjtFQURXOztFQUtmLFlBQUEsR0FBZSxTQUFDLFVBQUQsRUFBYSxRQUFiO1dBQ1gsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsUUFBaEIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixTQUFBO0FBQzNCLFVBQUE7TUFBQSxVQUFBLEdBQWEsQ0FBQSxDQUFFLElBQUY7QUFDYixhQUFBLENBQU0sVUFBVSxDQUFDLElBQVgsQ0FBZ0IsVUFBaEIsQ0FBTjtRQUNJLFVBQUEsR0FBYSxVQUFVLENBQUMsSUFBWCxDQUFBO01BRGpCO01BRUEsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFMLENBQWMsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsVUFBaEIsQ0FBMkIsQ0FBQyxLQUE1QixDQUFrQyxpQkFBbEMsQ0FBcUQsQ0FBQSxDQUFBLENBQW5FO2FBQ1gsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLE9BQVIsQ0FBZ0IsQ0FBQSxDQUFFLGdEQUFBLEdBQWlELFFBQWpELEdBQTBELFVBQTVELENBQWhCO0lBTDJCLENBQS9CO0VBRFc7O0VBVWYsTUFBQSxHQUFTLFNBQUMsT0FBRCxFQUFVLElBQVY7QUFDTCxRQUFBO0lBQUEsTUFBbUIsQ0FBQyxtQkFBRCxFQUFzQixrQkFBdEIsQ0FBbkIsRUFBQyxlQUFELEVBQVM7SUFDVCxPQUFPLENBQUMsV0FBUixDQUF1QixJQUFILEdBQWEsTUFBYixHQUF5QixNQUE3QztJQUNBLE9BQU8sQ0FBQyxRQUFSLENBQW9CLElBQUgsR0FBYSxNQUFiLEdBQXlCLE1BQTFDO0lBQ0EsRUFBQSxHQUFLLE9BQU8sQ0FBQyxJQUFSLENBQUE7SUFDTCxLQUFBLEdBQVEsT0FBTyxDQUFDLElBQVIsQ0FBYSxZQUFiO0FBQ1I7V0FBQSxDQUFBLENBQU0sQ0FBQyxLQUFBLEtBQVMsRUFBRSxDQUFDLElBQUgsQ0FBUSxVQUFSLENBQVYsQ0FBQSxJQUFpQyxpQ0FBdkMsQ0FBQTtNQUNJLEVBQUcsQ0FBRyxJQUFILEdBQWEsTUFBYixHQUF5QixNQUF6QixDQUFILENBQUE7b0JBQ0EsRUFBQSxHQUFLLEVBQUUsQ0FBQyxJQUFILENBQUE7SUFGVCxDQUFBOztFQU5LOztFQVdULGVBQUEsR0FBa0IsU0FBQyxVQUFELEVBQWEsUUFBYjtBQUNkLFFBQUE7SUFBQSxNQUFtQixDQUFDLG1CQUFELEVBQXNCLGtCQUF0QixDQUFuQixFQUFDLGVBQUQsRUFBUztXQUNULFVBQVUsQ0FBQyxJQUFYLENBQWdCLFFBQWhCLENBQ0ksQ0FBQyxRQURMLENBQ2MsTUFEZCxDQUVJLENBQUMsSUFGTCxDQUVVLFNBQUE7TUFDRixNQUFBLENBQU8sQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLE1BQVIsQ0FBQSxDQUFQLEVBQXlCLEtBQXpCO2FBQ0EsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLEtBQVIsQ0FBYyxTQUFBO0FBQ04sWUFBQTtRQUFBLEVBQUEsR0FBSyxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsTUFBUixDQUFBO1FBQ0wsSUFBRyxFQUFFLENBQUMsUUFBSCxDQUFZLE1BQVosQ0FBSDtpQkFBMkIsTUFBQSxDQUFPLEVBQVAsRUFBVyxLQUFYLEVBQTNCO1NBQUEsTUFBQTtpQkFBa0QsTUFBQSxDQUFPLEVBQVAsRUFBVyxJQUFYLEVBQWxEOztNQUZNLENBQWQ7SUFGRSxDQUZWO0VBRmM7O0VBV2xCLFlBQUEsR0FBZSxTQUFDLFVBQUQsRUFBYSxRQUFiLEVBQXVCLElBQXZCO0FBQ1gsUUFBQTtJQUFBLElBQUEsR0FBTyxVQUFVLENBQUMsSUFBWCxDQUFtQixRQUFELEdBQVUsTUFBNUI7SUFDUCxFQUFBLEdBQU8sVUFBVSxDQUFDLElBQVgsQ0FBbUIsUUFBRCxHQUFVLElBQTVCLENBQWdDLENBQUMsRUFBakMsQ0FBb0MsSUFBQSxHQUFPLENBQTNDO0lBQ1AsRUFBRSxDQUFDLFFBQUgsQ0FBWSwwQkFBWjtJQUNBLElBQUcsRUFBRSxDQUFDLEdBQUgsQ0FBTyxTQUFQLENBQUEsS0FBcUIsTUFBeEI7TUFDSSxRQUFBLEdBQVc7QUFDWCxhQUFBLENBQU0sUUFBUSxDQUFDLElBQVQsQ0FBYyxZQUFkLENBQU47UUFDSSxRQUFBLEdBQVcsUUFBUSxDQUFDLElBQVQsQ0FBQTtNQURmO01BRUEsTUFBQSxDQUFPLFFBQVAsRUFBaUIsSUFBakIsRUFKSjs7SUFLQSxVQUFBLEdBQWEsSUFBSSxDQUFDLE1BQUwsQ0FBQTtJQUNiLE9BQUEsR0FBYSxFQUFFLENBQUMsUUFBSCxDQUFBLENBQWEsQ0FBQztJQUMzQixVQUFBLEdBQWEsRUFBRSxDQUFDLE1BQUgsQ0FBQTtJQUNiLENBQUEsR0FBSSxPQUFBLEdBQVUsQ0FBQyxVQUFBLEdBQWEsQ0FBZCxDQUFWLEdBQTZCLENBQUMsVUFBQSxHQUFhLENBQWQ7V0FDakMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmO0VBYlc7O0VBZ0JmLFNBQUEsR0FBWSxTQUFDLFVBQUQsRUFBYSxHQUFiO0FBQ1IsUUFBQTtJQUFDLGFBQUEsTUFBRCxFQUFTLFdBQUEsSUFBVCxFQUFlLFdBQUEsSUFBZixFQUFxQixVQUFBO0lBQ3JCLElBQUcsTUFBQSxJQUFXLElBQWQ7TUFDSSxPQUFBLEdBQWEsTUFBRCxHQUFRLEdBQVIsR0FBVyxLQUQzQjtLQUFBLE1BQUE7TUFLSSxPQUFBLEdBQVU7TUFDVixLQUFBLEdBQVEsR0FOWjs7SUFPQSxJQUFHLElBQUg7TUFDSSxPQUFBLEdBQWEsT0FBRCxHQUFTLElBQVQsR0FBYSxLQUQ3Qjs7SUFFQSxJQUFHLEdBQUg7TUFDSSxPQUFBLEdBQVUsWUFBQSxHQUFhLEdBQWIsR0FBaUIsS0FBakIsR0FBc0IsT0FBdEIsR0FBOEIsT0FENUM7O1dBRUEsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsQ0FBQSxDQUFFLG9FQUFBLEdBRWQsT0FGYyxHQUVOLDJFQUZJLENBQWxCO0VBYlE7O0VBc0JaLElBQUEsR0FBTyxTQUFBO1dBQ0gsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsU0FBQTtBQUNyQixVQUFBO01BQUEsVUFBQSxHQUFhLENBQUEsQ0FBRSxJQUFGO01BQ2IsR0FBQSxHQUFTLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEtBQWhCO01BQ1QsTUFBQSxHQUFTLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFFBQWhCO01BQ1QsSUFBQSxHQUFTLFVBQVUsQ0FBQyxJQUFYLENBQWdCLE1BQWhCO01BQ1QsSUFBQSxHQUFZLFVBQVUsQ0FBQyxJQUFYLENBQWdCLFFBQWhCLENBQUgsR0FBaUMsUUFBakMsR0FBK0M7TUFDeEQsRUFBQSxHQUFTLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQWhCO01BQ1QsSUFBQSxHQUFTLFVBQVUsQ0FBQyxJQUFYLENBQWdCLE1BQWhCO01BRVQsSUFBRyxJQUFBLEtBQVEsUUFBWDtRQUNJLGNBQUEsR0FDSTtVQUFBLEdBQUEsRUFBSyxtQ0FBQSxHQUFvQyxFQUF6QztVQUNBLE9BQUEsRUFDSTtZQUFBLE1BQUEsRUFBUSxrQ0FBUjtXQUZKOztlQUlKLENBQUMsQ0FBQyxJQUFGLENBQU8sY0FBUCxDQUNJLENBQUMsSUFETCxDQUNVLFNBQUMsSUFBRDtBQUNGLGNBQUE7VUFESSxPQUFELEtBQUM7VUFDSixjQUFBLEdBQ0k7WUFBQSxHQUFBLEVBQUssc0RBQUEsR0FBdUQsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLEVBQS9ELEdBQWtFLFVBQXZFO1lBQ0EsT0FBQSxFQUNJO2NBQUEsTUFBQSxFQUFRLFlBQVI7YUFGSjs7aUJBSUosQ0FBQyxDQUFDLElBQUYsQ0FBTyxjQUFQLENBQ0ksQ0FBQyxJQURMLENBQ1UsU0FBQyxLQUFEO1lBQ0YsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsQ0FBQSxDQUFFLFdBQUEsQ0FBWSxLQUFaLENBQUYsQ0FBbEI7WUFDQSxZQUFBLENBQWEsVUFBYixFQUF5QixxQ0FBekI7WUFDQSxZQUFBLENBQWEsVUFBYixFQUF5QixxQ0FBekI7WUFDQSxlQUFBLENBQWdCLFVBQWhCLEVBQTRCLHVDQUE1QjtZQUNBLElBQUcsSUFBSDtjQUFhLFlBQUEsQ0FBYSxVQUFiLEVBQXlCLGtCQUF6QixFQUE2QyxJQUE3QyxFQUFiOzttQkFDQSxTQUFBLENBQVUsVUFBVixFQUFzQjtjQUFDLFFBQUEsTUFBRDtjQUFTLE1BQUEsSUFBVDtjQUFlLE1BQUEsSUFBZjtjQUFxQixLQUFBLEdBQXJCO2FBQXRCO1VBTkUsQ0FEVjtRQU5FLENBRFYsRUFOSjtPQUFBLE1BQUE7UUF3QkksY0FBQSxHQUNJO1VBQUEsR0FBQSxFQUFLLHNEQUFBLEdBQXVELEVBQXZELEdBQTBELFVBQS9EO1VBQ0EsT0FBQSxFQUNJO1lBQUEsTUFBQSxFQUFRLFlBQVI7V0FGSjs7ZUFLSixDQUFDLENBQUMsSUFBRixDQUFPLGNBQVAsQ0FDSSxDQUFDLElBREwsQ0FDVSxTQUFDLEtBQUQ7VUFDRixVQUFVLENBQUMsTUFBWCxDQUFrQixDQUFBLENBQUUsV0FBQSxDQUFZLEtBQVosQ0FBRixDQUFsQjtVQUNBLFlBQUEsQ0FBYSxVQUFiLEVBQXlCLHFDQUF6QjtVQUNBLFlBQUEsQ0FBYSxVQUFiLEVBQXlCLHFDQUF6QjtVQUNBLGVBQUEsQ0FBZ0IsVUFBaEIsRUFBNEIsdUNBQTVCO1VBQ0EsSUFBRyxJQUFIO1lBQWEsWUFBQSxDQUFhLFVBQWIsRUFBeUIsa0JBQXpCLEVBQTZDLElBQTdDLEVBQWI7O2lCQUNBLFNBQUEsQ0FBVSxVQUFWLEVBQXNCO1lBQUMsUUFBQSxNQUFEO1lBQVMsTUFBQSxJQUFUO1lBQWUsTUFBQSxJQUFmO1lBQXFCLEtBQUEsR0FBckI7V0FBdEI7UUFORSxDQURWLEVBOUJKOztJQVRxQixDQUF6QjtFQURHOztFQXNEUCxJQUFHLGdEQUFIO0lBRUksTUFBTSxDQUFDLE9BQVAsR0FBaUI7TUFBRSxNQUFBLElBQUY7TUFBUSxXQUFBLFNBQVI7TUFBbUIsYUFBQSxXQUFuQjtNQUZyQjtHQUFBLE1BR0ssSUFBRyxnREFBSDtJQUVELENBQUEsQ0FBRSxRQUFGLENBQVcsQ0FBQyxLQUFaLENBQWtCLElBQWxCLEVBRkM7O0FBbE9MIiwiZmlsZSI6ImpzL29lbWJlZC10cmF2aXMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjXG4jIHNvbWUgdXRpbGl0aWVzXG4jXG51dGlsID1cbiAgICBuc2VjMnNlYzogKG5zZWMpIC0+IE1hdGgucm91bmQoIG5zZWMgLyAxMDAwMDAwMCkgLyAxMDBcblxuI1xuIyB0ZXJtaW5hbCBjb2RlcyB0byBIdG1sXG4jXG5hbnNpMkh0bWwgPSAobGluZSwgc3R5bGVTZXRzKSAtPlxuICAgIGFuc2kgPSAvKC4pXFxbKFxcZCs7KT8oXFxkKykqbS9nXG4gICAgRVNDID0gU3RyaW5nLmZyb21DaGFyQ29kZSAnMjcnXG4gICAgc3RhY2sgPSAnJ1xuXG4gICAgZ2V0U3R5bGVWYWx1ZSA9IChzdHlsZVNldCkgLT5cbiAgICAgICAgdW5sZXNzIHN0eWxlU2V0PyB0aGVuIHJldHVybiAnJ1xuICAgICAgICByZXN1bHRzID0gW11cbiAgICAgICAgZm9yIGtleSwgdmFsdWUgb2Ygc3R5bGVTZXRcbiAgICAgICAgICAgIGlmIHZhbHVlPyB0aGVuIHJlc3VsdHMucHVzaCBcIiN7a2V5fToje3ZhbHVlfVwiXG4gICAgICAgIHJldHVybiByZXN1bHRzLmpvaW4gJzsnXG5cbiAgICBjYWxsYmFjayA9IChtYXRjaCwgYjAsIGIxLCBiMikgLT5cbiAgICAgICAgaWYgRVNDIGlzbnQgYjAgdGhlbiByZXR1cm4gbWF0Y2hcbiAgICAgICAgaWYgKCcnIGlzIGIyKSBvciAobnVsbCBpcyBiMikgdGhlbiBiMiA9ICcwJ1xuICAgICAgICByZXMgPSAnJ1xuICAgICAgICBmb3IgaSBpbiBbMi4uKGFyZ3VtZW50cy5sZW5ndGggLSAzKV0gI2V4Y2x1ZGUgJ29mZnNldCcgYW5kICdzdHJpbmcnIGFyZ3VtZW50c1xuICAgICAgICAgICAgY29kZSA9IHBhcnNlSW50KGFyZ3VtZW50c1tpXSkudG9TdHJpbmcoKVxuICAgICAgICAgICAgaWYgY29kZSBpbiBPYmplY3Qua2V5cyBzdHlsZVNldHNcbiAgICAgICAgICAgICAgICBzdGFjayArPSAnPC9zcGFuPidcbiAgICAgICAgICAgICAgICByZXMgKz0gJzxzcGFuIHN0eWxlPVwiJyArIGdldFN0eWxlVmFsdWUoc3R5bGVTZXRzW2NvZGVdKSArICdcIj4nXG4gICAgICAgIHJldHVybiByZXNcblxuICAgIHJldHVybiAobGluZS5yZXBsYWNlIGFuc2ksIGNhbGxiYWNrKSArIHN0YWNrXG5cbiNcbiMgZGV0ZWN0IHRyYXZpcyBjb250cm9sIGNvZGVcbiNcbmZvcm1hdExpbmVzID0gKGxpbmVzKSAtPlxuICAgIGlmIHR5cGVvZiBsaW5lcyBpcyAnc3RyaW5nJyB0aGVuIGxpbmVzID0gbGluZXMuc3BsaXQgJ1xcbidcbiAgICBodG1sID0gJydcbiAgICBFU0MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlIDI3XG4gICAgQ1IgPSBTdHJpbmcuZnJvbUNoYXJDb2RlIDEzXG4gICAgZm9yIGxpbmUsIGluZGV4IGluIGxpbmVzXG4gICAgICAgIGF0dHIgPSAnJ1xuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlIC90cmF2aXNfKGZvbGR8dGltZSk6KHN0YXJ0fGVuZCk6KC4rKS9nLCAobWF0Y2gsIHAxLCBwMiwgcDMpIC0+XG4gICAgICAgICAgICBpZiBwMT8gYW5kIHAyP1xuICAgICAgICAgICAgICAgIGF0dHIgKz0gXCIgZGF0YS0je3AxfS0je3AyfT1cXFwiI3twM31cXFwiXCJcbiAgICAgICAgICAgIHJldHVybiAnJ1xuXG4gICAgICAgIGxpbmUgPSBhbnNpMkh0bWwgbGluZSwgc3R5bGVTZXRzXG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UgbmV3IFJlZ0V4cChDUiwnZycpLCAnJ1xuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlIG5ldyBSZWdFeHAoRVNDLCdnJyksICcnXG4gICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UgL1xcW1xcZD9LL2csICcnXG5cbiAgICAgICAgaHRtbCArPSBcIjxwI3thdHRyfT48YT4je2luZGV4ICsgMX08L2E+I3tsaW5lfTwvcD5cIlxuXG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwidHJhdmlzLWxvZy1ib2R5XFxcIj48ZGl2IGNsYXNzPVxcXCJ0cmF2aXMtcHJlXFxcIj4je2h0bWx9PC9kaXY+PC9kaXY+XCJcblxuI1xuIyBkZWZpbmUgdGVybWluYWwgY29kZSBzdHlsZXNcbiNcbnN0eWxlU2V0cyA9XG4gICAgMDogIHsgJ2ZvbnQtd2VpZ2h0JzogJ25vcm1hbCcsICdmb250LXN0eWxlJzogJ25vcm1hbCcsICd0ZXh0LWRlY29yYXRpb24nOiAnbm9uZScsJ2JhY2tncm91bmQtY29sb3InOiAnIzIyMicsIGNvbG9yOiAnI2YxZjFmMScgfVxuICAgIDE6ICB7ICdmb250LXdlaWdodCc6ICdib2xkJyB9XG4gICAgMzogIHsgJ2ZvbnQtc3R5bGUnOiAnaXRhbGljJyB9XG4gICAgNDogIHsgJ3RleHQtZGVjb3JhdGlvbic6ICd1bmRlcmxpbmUnIH1cbiAgICA1OiAgeyAnYW5pbWF0aW9uJzogJ2JsaW5rIDFzIHN0ZXAtZW5kIGluZmluaXRlJywgJy13ZWJraXQtYW5pbWF0aW9uJzogJ2JsaW5rIDFzIHN0ZXAtZW5kIGluZmluaXRlJyB9XG4gICAgNzogIHsgaW52ZXJ0OiB0cnVlIH1cbiAgICA5OiAgeyAndGV4dC1kZWNvcmF0aW9uJzogJ2xpbmUtdGhyb3VnaCcgfVxuICAgIDIzOiB7ICdmb250LXN0eWxlJzogJ25vcm1hbCcgfVxuICAgIDI0OiB7ICd0ZXh0LWRlY29yYXRpb24nOiAnbm9uZScgfVxuICAgIDI1OiB7ICdhbmltYXRpb24nOiAnbm9uZScsICctd2Via2l0LWFuaW1hdGlvbic6ICdub25lJyB9XG4gICAgMjc6IHsgaW52ZXJ0OiBmYWxzZSB9XG4gICAgMjk6IHsgJ3RleHQtZGVjb3JhdGlvbic6ICdub25lJyB9XG4gICAgMzA6IHsgY29sb3I6ICcjNEU0RTRFJyB9ICMgYmxhY2tcbiAgICAzMTogeyBjb2xvcjogJyNGRjlCOTMnIH0gIyByZWRcbiAgICAzMjogeyBjb2xvcjogJyNCMUZENzknIH0gIyBncmVlblxuICAgIDMzOiB7IGNvbG9yOiAnI0ZGRkZCNicgfSAjIHllbGxvd1xuICAgIDM0OiB7IGNvbG9yOiAnI0I1RENGRScgfSAjIGJsdWVcbiAgICAzNTogeyBjb2xvcjogJyNGRjczRkQnIH0gIyBtYWdlbXRhXG4gICAgMzY6IHsgY29sb3I6ICcjRTBGRkZGJyB9ICMgY3lhblxuICAgIDM3OiB7IGNvbG9yOiAnI2YxZjFmMScgfSAjIHdoaXRlXG4gICAgMzk6IHsgY29sb3I6ICcjZjFmMWYxJyB9ICNkZWZhdWx0XG4gICAgNDA6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnIzRFNEU0RScgfSAjIGJsYWNrXG4gICAgNDE6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI0ZGOUI5MycgfSAjIHJlZFxuICAgIDQyOiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNCMUZENzknIH0gIyBncmVlblxuICAgIDQzOiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGRkZGQjYnIH0gIyB5ZWxsb3dcbiAgICA0NDogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjQjVEQ0ZFJyB9ICMgYmx1ZVxuICAgIDQ1OiB7ICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGRjczRkQnIH0gIyBtYWdlbXRhXG4gICAgNDY6IHsgJ2JhY2tncm91bmQtY29sb3InOiAnI0UwRkZGRicgfSAjIGN5YW5cbiAgICA0NzogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjZjFmMWYxJyB9ICMgd2hpdGVcbiAgICA0OTogeyAnYmFja2dyb3VuZC1jb2xvcic6ICcjMjIyJyB9ICMgZGVmYXVsdFxuXG5cblxuaWYgd2luZG93PyB0aGVuICQgPSBqUXVlcnlcblxuYWRkRm9sZExhYmVsID0gKCRjb250YWluZXIsIHNlbGVjdG9yKSAtPlxuICAgICRjb250YWluZXIuZmluZChzZWxlY3RvcikuZWFjaCAtPlxuICAgICAgICAkKHRoaXMpLnByZXBlbmQgJCAnPHNwYW4gY2xhc3M9XCJ0cmF2aXMtaW5mbyB0cmF2aXMtZm9sZC1zdGFydFwiPicgKyAoJCh0aGlzKS5kYXRhICdmb2xkLXN0YXJ0JykgKyAnPC9zcGFuPidcblxuXG5hZGRUaW1lTGFiZWwgPSAoJGNvbnRhaW5lciwgc2VsZWN0b3IpIC0+XG4gICAgJGNvbnRhaW5lci5maW5kKHNlbGVjdG9yKS5lYWNoIC0+XG4gICAgICAgICRwYXJhZ3JhcGggPSAkKHRoaXMpXG4gICAgICAgIHVudGlsICRwYXJhZ3JhcGguZGF0YSAndGltZS1lbmQnXG4gICAgICAgICAgICAkcGFyYWdyYXBoID0gJHBhcmFncmFwaC5uZXh0KClcbiAgICAgICAgZHVyYXRpb24gPSB1dGlsLm5zZWMyc2VjICRwYXJhZ3JhcGguZGF0YSgndGltZS1lbmQnKS5tYXRjaCgvZHVyYXRpb249KFxcZCopJC8pWzFdXG4gICAgICAgICQodGhpcykucHJlcGVuZCAkIFwiPHNwYW4gY2xhc3M9XFxcInRyYXZpcy1pbmZvIHRyYXZpcy10aW1lLXN0YXJ0XFxcIj4je2R1cmF0aW9ufXM8L3NwYW4+XCJcblxuXG5cbnRvZ2dsZSA9ICgkaGFuZGxlLCBib29sKSAtPlxuICAgIFtvcGVuZWQsIGNsb3NlZF0gPSBbJ3RyYXZpcy1mb2xkLWNsb3NlJywgJ3RyYXZpcy1mb2xkLW9wZW4nXVxuICAgICRoYW5kbGUucmVtb3ZlQ2xhc3MoaWYgYm9vbCB0aGVuIGNsb3NlZCBlbHNlIG9wZW5lZClcbiAgICAkaGFuZGxlLmFkZENsYXNzKGlmIGJvb2wgdGhlbiBvcGVuZWQgZWxzZSBjbG9zZWQpXG4gICAgJG4gPSAkaGFuZGxlLm5leHQoKVxuICAgIGxhYmVsID0gJGhhbmRsZS5kYXRhICdmb2xkLXN0YXJ0J1xuICAgIHVudGlsIChsYWJlbCBpcyAkbi5kYXRhICdmb2xkLWVuZCcpIG9yICgkbi5kYXRhICdmb2xkLXN0YXJ0Jyk/XG4gICAgICAgICRuW2lmIGJvb2wgdGhlbiAnc2hvdycgZWxzZSAnaGlkZSddKClcbiAgICAgICAgJG4gPSAkbi5uZXh0KClcblxuXG5hZGRGb2xkSGFuZGxlcnMgPSAoJGNvbnRhaW5lciwgc2VsZWN0b3IpIC0+XG4gICAgW29wZW5lZCwgY2xvc2VkXSA9IFsndHJhdmlzLWZvbGQtY2xvc2UnLCAndHJhdmlzLWZvbGQtb3BlbiddXG4gICAgJGNvbnRhaW5lci5maW5kKHNlbGVjdG9yKVxuICAgICAgICAuYWRkQ2xhc3MgY2xvc2VkXG4gICAgICAgIC5lYWNoIC0+XG4gICAgICAgICAgICB0b2dnbGUoJCh0aGlzKS5wYXJlbnQoKSwgZmFsc2UpXG4gICAgICAgICAgICAkKHRoaXMpLmNsaWNrIC0+XG4gICAgICAgICAgICAgICAgICAgICRwID0gJCh0aGlzKS5wYXJlbnQoKVxuICAgICAgICAgICAgICAgICAgICBpZiAkcC5oYXNDbGFzcyBvcGVuZWQgdGhlbiB0b2dnbGUoJHAsIGZhbHNlKSBlbHNlIHRvZ2dsZSgkcCwgdHJ1ZSlcblxuXG5hY3RpdmF0ZUxpbmUgPSAoJGNvbnRhaW5lciwgc2VsZWN0b3IsIGxpbmUpIC0+XG4gICAgJHByZSA9ICRjb250YWluZXIuZmluZChcIiN7c2VsZWN0b3J9IHByZVwiKVxuICAgICRwICAgPSAkY29udGFpbmVyLmZpbmQoXCIje3NlbGVjdG9yfSBwXCIpLmVxKGxpbmUgLSAxKVxuICAgICRwLmFkZENsYXNzICd0cmF2aXMtZ2l2ZW4tYWN0aXZlLWxpbmUnXG4gICAgaWYgJHAuY3NzKCdkaXNwbGF5JykgaXMgJ25vbmUnXG4gICAgICAgICRwb2ludGVyID0gJHBcbiAgICAgICAgdW50aWwgJHBvaW50ZXIuZGF0YSAnZm9sZC1zdGFydCdcbiAgICAgICAgICAgICRwb2ludGVyID0gJHBvaW50ZXIucHJldigpXG4gICAgICAgIHRvZ2dsZSgkcG9pbnRlciwgdHJ1ZSlcbiAgICBib2R5SGVpZ2h0ID0gJHByZS5oZWlnaHQoKVxuICAgIGxpbmVUb3AgICAgPSAkcC5wb3NpdGlvbigpLnRvcFxuICAgIGxpbmVIZWlnaHQgPSAkcC5oZWlnaHQoKVxuICAgIGQgPSBsaW5lVG9wIC0gKGJvZHlIZWlnaHQgLyAyKSArIChsaW5lSGVpZ2h0IC8gMilcbiAgICAkcHJlLnNjcm9sbFRvcCBkXG5cblxuYWRkRm9vdGVyID0gKCRjb250YWluZXIsIGFyZykgLT5cbiAgICB7YXV0aG9yLCByZXBvLCBsaW5lLCB1cmx9ID0gYXJnXG4gICAgaWYgYXV0aG9yIGFuZCByZXBvXG4gICAgICAgIGNvbnRlbnQgPSBcIiN7YXV0aG9yfS8je3JlcG99XCJcbiAgICAgICAgIyBuZWVkIHRvIGJlIGluamVjdCBicmFuY2ggaW5mb3JtYXRpb24gdG8gc2hvdyBiYWRnZVxuICAgICAgICAjIGJhZGdlID0gXCI8aW1nIGNsYXNzPVxcXCJ0cmF2aXMtYmFkZ2VcXFwiIHNyYz1cXFwiaHR0cHM6Ly9hcGkudHJhdmlzLWNpLm9yZy8je2F1dGhvcn0vI3tyZXBvfS5zdmc/YnJhbmNoPSN7YnJhbmNofVxcXCIgYWx0PVxcXCJzdGF0ZVxcXCIgLz5cIlxuICAgIGVsc2VcbiAgICAgICAgY29udGVudCA9ICdUaGlzIHJlcG9zaXRvcnknXG4gICAgICAgIGJhZGdlID0gJydcbiAgICBpZiBsaW5lXG4gICAgICAgIGNvbnRlbnQgPSBcIiN7Y29udGVudH0jTCN7bGluZX1cIlxuICAgIGlmIHVybFxuICAgICAgICBjb250ZW50ID0gXCI8YSBocmVmPVxcXCIje3VybH1cXFwiPiN7Y29udGVudH08L2E+XCJcbiAgICAkY29udGFpbmVyLmFwcGVuZCAkIFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XFxcInRyYXZpcy1sb2ctZm9vdGVyXFxcIj48aDIgY2xhc3M9XCJ0cmF2aXMtdGl0bGVcIj5cbiAgICAgICAgI3tjb250ZW50fSBidWlsZCB3aXRoIDxhIGhyZWY9XFxcImh0dHBzOi8vdHJhdmlzLWNpLm9yZ1xcXCI+VHJhdmlzIENJPC9hPi5cbiAgICA8L2gyPjwvZGl2PlxuICAgIFwiXCJcIlxuXG4jXG4jIG1haW4gbW9kdWxlXG4jXG5tYWluID0gLT5cbiAgICAkKCcub2VtYmVkLXRyYXZpcycpLmVhY2ggLT5cbiAgICAgICAgJGNvbnRhaW5lciA9ICQgdGhpc1xuICAgICAgICB1cmwgICAgPSAkY29udGFpbmVyLmRhdGEgJ3VybCdcbiAgICAgICAgYXV0aG9yID0gJGNvbnRhaW5lci5kYXRhICdhdXRob3InXG4gICAgICAgIHJlcG8gICA9ICRjb250YWluZXIuZGF0YSAncmVwbydcbiAgICAgICAgdHlwZSAgID0gaWYgJGNvbnRhaW5lci5kYXRhICdidWlsZHMnIHRoZW4gJ2J1aWxkcycgZWxzZSAnam9icydcbiAgICAgICAgaWQgICAgID0gJGNvbnRhaW5lci5kYXRhIHR5cGVcbiAgICAgICAgbGluZSAgID0gJGNvbnRhaW5lci5kYXRhICdsaW5lJ1xuXG4gICAgICAgIGlmIHR5cGUgaXMgJ2J1aWxkcydcbiAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zID1cbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9hcGkudHJhdmlzLWNpLm9yZy9idWlsZHMvI3tpZH1cIlxuICAgICAgICAgICAgICAgIGhlYWRlcnM6XG4gICAgICAgICAgICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL3ZuZC50cmF2aXMtY2kuMitqc29uJ1xuXG4gICAgICAgICAgICAkLmFqYXggcmVxdWVzdE9wdGlvbnNcbiAgICAgICAgICAgICAgICAudGhlbiAoe2pvYnN9KSAtPlxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9ucyA9XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2FyY2hpdmUudHJhdmlzLWNpLm9yZy9qb2JzLyN7am9ic1swXS5pZH0vbG9nLnR4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjY2VwdDogJ3RleHQvcGxhaW4nXG5cbiAgICAgICAgICAgICAgICAgICAgJC5hamF4IHJlcXVlc3RPcHRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbiAobGluZXMpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5hcHBlbmQgJCBmb3JtYXRMaW5lcyhsaW5lcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRGb2xkTGFiZWwgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHkgcFtkYXRhLWZvbGQtc3RhcnRdJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZFRpbWVMYWJlbCAkY29udGFpbmVyLCAnLnRyYXZpcy1sb2ctYm9keSBwW2RhdGEtdGltZS1zdGFydF0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRm9sZEhhbmRsZXJzICRjb250YWluZXIsICcudHJhdmlzLWxvZy1ib2R5IHBbZGF0YS1mb2xkLXN0YXJ0XT5hJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxpbmUgdGhlbiBhY3RpdmF0ZUxpbmUgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHknLCBsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRm9vdGVyICRjb250YWluZXIsIHthdXRob3IsIHJlcG8sIGxpbmUsIHVybH1cblxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zID1cbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2FyY2hpdmUudHJhdmlzLWNpLm9yZy9qb2JzLyN7aWR9L2xvZy50eHRcIlxuICAgICAgICAgICAgICAgIGhlYWRlcnM6XG4gICAgICAgICAgICAgICAgICAgIEFjY2VwdDogJ3RleHQvcGxhaW4nXG5cblxuICAgICAgICAgICAgJC5hamF4IHJlcXVlc3RPcHRpb25zXG4gICAgICAgICAgICAgICAgLnRoZW4gKGxpbmVzKSAtPlxuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmFwcGVuZCAkIGZvcm1hdExpbmVzKGxpbmVzKVxuICAgICAgICAgICAgICAgICAgICBhZGRGb2xkTGFiZWwgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHkgcFtkYXRhLWZvbGQtc3RhcnRdJ1xuICAgICAgICAgICAgICAgICAgICBhZGRUaW1lTGFiZWwgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHkgcFtkYXRhLXRpbWUtc3RhcnRdJ1xuICAgICAgICAgICAgICAgICAgICBhZGRGb2xkSGFuZGxlcnMgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHkgcFtkYXRhLWZvbGQtc3RhcnRdPmEnXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmUgdGhlbiBhY3RpdmF0ZUxpbmUgJGNvbnRhaW5lciwgJy50cmF2aXMtbG9nLWJvZHknLCBsaW5lXG4gICAgICAgICAgICAgICAgICAgIGFkZEZvb3RlciAkY29udGFpbmVyLCB7YXV0aG9yLCByZXBvLCBsaW5lLCB1cmx9XG5cblxuXG4jXG4jIGVuZ2luZSBoYW5kbGluZ1xuI1xuaWYgbW9kdWxlP1xuICAgICMgZXhwb3J0IGZvciB0ZXN0XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7IHV0aWwsIGFuc2kySHRtbCwgZm9ybWF0TGluZXMgfVxuZWxzZSBpZiB3aW5kb3c/XG4gICAgIyBleGVjIG9uIGJyb3dzZXJcbiAgICAkKGRvY3VtZW50KS5yZWFkeSBtYWluXG4iXX0=
