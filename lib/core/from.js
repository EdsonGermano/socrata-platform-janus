(function() {
  var Varying, applyMaps, build, caseSet, conj, defaultCases, from, ic, identity, immediate, internalCases, mappedPoint, match, matchFinal, otherwise, terminus, val, _ref, _ref1,
    __slice = [].slice;

  Varying = require('./varying').Varying;

  _ref = require('./case'), caseSet = _ref.caseSet, match = _ref.match, otherwise = _ref.otherwise;

  _ref1 = require('../util/util'), immediate = _ref1.immediate, identity = _ref1.identity;

  conj = function(x, y) {
    return x.concat([y]);
  };

  internalCases = ic = caseSet('varying', 'map', 'flatMap');

  defaultCases = caseSet('dynamic', 'attr', 'definition', 'varying');

  val = function(conjunction, applicants) {
    var result;

    if (applicants == null) {
      applicants = [];
    }
    result = {};
    result.map = function(f) {
      var last, rest, _i;

      rest = 2 <= applicants.length ? __slice.call(applicants, 0, _i = applicants.length - 1) : (_i = 0, []), last = applicants[_i++];
      return val(conjunction, conj(rest, internalCases.map({
        inner: last,
        f: f
      })));
    };
    result.flatMap = function(f) {
      var last, rest, _i;

      rest = 2 <= applicants.length ? __slice.call(applicants, 0, _i = applicants.length - 1) : (_i = 0, []), last = applicants[_i++];
      return val(conjunction, conj(rest, internalCases.flatMap({
        inner: last,
        f: f
      })));
    };
    result.all = terminus(applicants);
    result.and = conjunction(applicants);
    return result;
  };

  build = function(cases) {
    var base, conjunction, kase, methods, name;

    methods = {};
    for (name in cases) {
      kase = cases[name];
      if (name !== 'dynamic' && name !== 'varying') {
        (function(name, kase) {
          return methods[name] = function(applicants) {
            return function() {
              var args;

              args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              return val(conjunction, conj(applicants, kase(args)));
            };
          };
        })(name, kase);
      }
    }
    methods.varying = function(applicants) {
      return function(f) {
        return val(conjunction, conj(applicants, cases.varying(f)));
      };
    };
    base = cases.dynamic != null ? (function(applicants) {
      return function() {
        var args;

        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return val(conjunction, conj(applicants, cases.dynamic(args)));
      };
    }) : (function() {
      return {};
    });
    conjunction = function(applicants) {
      var k, result, v;

      if (applicants == null) {
        applicants = [];
      }
      result = base(applicants);
      for (k in methods) {
        v = methods[k];
        result[k] = v(applicants);
      }
      return result;
    };
    return conjunction();
  };

  mappedPoint = function(point) {
    return match(ic.map(function(_arg) {
      var f, inner;

      inner = _arg.inner, f = _arg.f;
      return match(ic.varying(function(x) {
        return ic.varying(x.map(f));
      }), otherwise(function() {
        return ic.map({
          inner: inner,
          f: f
        });
      }))(mappedPoint(point)(inner));
    }), ic.flatMap(function(_arg) {
      var f, inner;

      inner = _arg.inner, f = _arg.f;
      return match(ic.varying(function(x) {
        return ic.varying(x.flatMap(f));
      }), otherwise(function() {
        return ic.flatMap({
          inner: inner,
          f: f
        });
      }))(mappedPoint(point)(inner));
    }), ic.varying(function(x) {
      return ic.varying(x);
    }), otherwise(function(x) {
      var result;

      result = point(x);
      if ((result != null ? result.isVarying : void 0) === true) {
        return ic.varying(result);
      } else {
        return x;
      }
    }));
  };

  matchFinal = match(ic.varying(function(x) {
    return x;
  }), otherwise(function(x) {
    return new Varying(x);
  }));

  applyMaps = function(applicants, maps) {
    var apply, first, m, rest, v, _i, _len;

    first = maps[0], rest = 2 <= maps.length ? __slice.call(maps, 1) : [];
    if (first == null) {
      first = ic.map(identity);
    }
    v = match(ic.map(function(f) {
      var x;

      return Varying.mapAll.apply(null, ((function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = applicants.length; _i < _len; _i++) {
          x = applicants[_i];
          _results.push(matchFinal(x));
        }
        return _results;
      })()).concat([f]));
    }), ic.flatMap(function(f) {
      var x;

      return Varying.flatMapAll.apply(null, ((function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = applicants.length; _i < _len; _i++) {
          x = applicants[_i];
          _results.push(matchFinal(x));
        }
        return _results;
      })()).concat([f]));
    }), otherwise(function() {
      throw 1;
    }))(first);
    apply = match(ic.map(function(x) {
      return v.map(x);
    }), ic.flatMap(function(x) {
      return v.flatMap(x);
    }), otherwise(function() {
      throw 1;
    }));
    for (_i = 0, _len = rest.length; _i < _len; _i++) {
      m = rest[_i];
      v = apply(m);
    }
    return v;
  };

  terminus = function(applicants, maps) {
    var result;

    if (maps == null) {
      maps = [];
    }
    result = function(f) {
      return terminus(applicants, maps.concat([ic.flatMap(f)]));
    };
    result.flatMap = function(f) {
      return terminus(applicants, maps.concat([ic.flatMap(f)]));
    };
    result.map = function(f) {
      return terminus(applicants, maps.concat([ic.map(f)]));
    };
    result.point = function(f) {
      var point, x;

      point = mappedPoint(f);
      return terminus((function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = applicants.length; _i < _len; _i++) {
          x = applicants[_i];
          _results.push(point(x));
        }
        return _results;
      })(), maps);
    };
    result.react = function(f_) {
      return applyMaps(applicants, maps).react(f_);
    };
    result.reactNow = function(f_) {
      return applyMaps(applicants, maps).reactNow(f_);
    };
    result.get = function() {
      return matchFinal(applicants[0]);
    };
    return result;
  };

  from = build(defaultCases);

  from.build = build;

  from["default"] = defaultCases;

  module.exports = from;

}).call(this);