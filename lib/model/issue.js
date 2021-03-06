(function() {
  var Base, Issue, Varying, util,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Base = require('../core/base').Base;

  Varying = require('../core/varying').Varying;

  util = require('../util/util');

  Issue = (function(_super) {
    __extends(Issue, _super);

    function Issue(_arg) {
      var active, message, severity, target, _ref;

      _ref = _arg != null ? _arg : {}, active = _ref.active, severity = _ref.severity, message = _ref.message, target = _ref.target;
      this.active = Varying.ly(active != null ? active : false);
      this.severity = Varying.ly(severity != null ? severity : 0);
      this.message = Varying.ly(message != null ? message : '');
      this.target = Varying.ly(target);
    }

    return Issue;

  })(Base);

  util.extend(module.exports, {
    Issue: Issue
  });

}).call(this);
