// Generated by LiveScript 1.4.0
(function(){
  var ref$, map, fold1, keys, values, first, flatten, colors, Backbone, _, h, metaExtender, extender, metaClassers, slice$ = [].slice;
  ref$ = require('prelude-ls'), map = ref$.map, fold1 = ref$.fold1, keys = ref$.keys, values = ref$.values, first = ref$.first, flatten = ref$.flatten;
  colors = require('colors');
  Backbone = require('backbone');
  _ = require('underscore');
  h = require('helpers');
  Backbone.Model.extend4000 = function(){
    var classes;
    classes = slice$.call(arguments);
    _.map(this.extenders, function(extender){
      var newCls;
      newCls = extender.apply(this, classes);
      if (newCls) {
        return classes.push(newCls);
      }
    });
    return this.extend(h.uextend(classes));
  };
  metaExtender = {};
  metaExtender.mergeAttribute = curry$(function(validate, join, name){
    return function(){
      var classes, joinedAttribute, ret;
      classes = slice$.call(arguments);
      joinedAttribute = _.reduce(classes, function(joined, cls){
        var attr;
        attr = cls[name];
        if (!validate || validate(attr)) {
          if (joined) {
            return join(joined, attr);
          } else {
            return attr;
          }
        } else {
          return joined;
        }
      }, void 8);
      if (joinedAttribute) {
        ret = {};
        ret[name] = joinedAttribute;
        return ret;
      } else {}
    };
  });
  metaExtender.chainF = metaExtender.mergeAttribute(function(f){
    return (f != null ? f.constructor : void 8) === Function;
  }, function(f1, f2){
    return compose$(f1, f2);
  });
  metaExtender.mergeDict = metaExtender.mergeAttribute(function(d){
    return (d != null ? d.constructor : void 8) === Object;
  }, function(d1, d2){
    return _.extend({}, d1, d2);
  });
  metaExtender.mergeDictDeep = metaExtender.mergeAttribute(function(d){
    return (d != null ? d.constructor : void 8) === Object;
  }, function(d1, d2){
    return h.extend(d1, d2);
  });
  extender = {};
  extender.initialize = metaExtender.chainF('initialize');
  extender.defaults = metaExtender.mergeDict('defaults');
  extender.deepDefaults = metaExtender.mergeDictDeep('defaults');
  Backbone.Model.extenders = [extender.initialize];
  Backbone.Model.meta = [];
  metaClassers = {};
  _.extend(exports, Backbone);
  function curry$(f, bound){
    var context,
    _curry = function(args) {
      return f.length > 1 ? function(){
        var params = args ? args.concat() : [];
        context = bound ? context || this : this;
        return params.push.apply(params, arguments) <
            f.length && arguments.length ?
          _curry.call(context, params) : f.apply(context, params);
      } : f;
    };
    return _curry();
  }
  function compose$() {
    var functions = arguments;
    return function() {
      var i, result;
      result = functions[0].apply(this, arguments);
      for (i = 1; i < functions.length; ++i) {
        result = functions[i](result);
      }
      return result;
    };
  }
}).call(this);
