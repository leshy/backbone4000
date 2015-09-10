// Generated by LiveScript 1.4.0
(function(){
  var _, h, Backbone, SubContext, metaMerger, merger, slice$ = [].slice;
  _ = require('underscore');
  h = require('helpers');
  Backbone = require('./jspart');
  _.extend(exports, Backbone);
  Backbone.Model.extend4000 = Backbone.View.extend4000 = Backbone.Collection.extend4000 = function(){
    var classes, classProperties, classInherit, mergers, newClass, transformers, this$ = this;
    classes = slice$.call(arguments);
    classProperties = {};
    classes.reverse();
    classes = _.map(classes, function(cls){
      var err;
      if (!cls) {
        console.log("one of my classes is empty, will throw:\n", classes);
        err = new Error('extend4000 called with an empty class');
        console.log(err.stack);
        throw err;
      }
      if (cls.prototype) {
        return cls.prototype;
      } else {
        return cls;
      }
    });
    classInherit = function(attrName){
      var newAttr;
      newAttr = h.filterFalse(_.flatten(_.pluck(classes, attrName)));
      if (newAttr) {
        return classProperties[attrName] = h.push(this$[attrName], newAttr);
      }
      return this$[attrName];
    };
    mergers = classInherit('mergers');
    _.map(mergers, function(merger){
      return h.pushm(classes, merger.call(this$, classes.concat(this$.prototype)));
    });
    newClass = _.reduce(classes, function(newClass, includeClass){
      return newClass.extend(includeClass);
    }, this);
    transformers = classInherit('transformers');
    newClass = _.reduce(transformers || [], function(newClass, transformer){
      return transformer(newClass, this$);
    }, newClass);
    return newClass = newClass.extend({}, classProperties);
  };
  SubContext = Backbone.Model.extend4000({
    remove: function(){
      return this.stopListening();
    }
  });
  Backbone.Model.prototype.subContext = function(){
    return new SubContext();
  };
  metaMerger = exports.metaMerger = {};
  metaMerger.iterative = curry$(function(options, attrName){
    return function(classes){
      var right, ref$, check, join, postJoin, iterF, joinedAttribute, ret;
      right = (ref$ = options.right) != null ? ref$ : false, check = options.check, join = options.join, postJoin = options.postJoin;
      if (right) {
        iterF = _.reduceRight;
      } else {
        iterF = _.reduce;
      }
      joinedAttribute = iterF(classes, function(joined, cls){
        var attr;
        attr = cls[attrName];
        if (!check || check(attr)) {
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
        ret[attrName] = joinedAttribute;
        if (postJoin) {
          return postJoin(ret, attrName, options);
        } else {
          return ret;
        }
      } else {}
    };
  });
  metaMerger.mergeAttributeLeft = metaMerger.mergeAttribute = metaMerger.iterative;
  metaMerger.chainF = metaMerger.mergeAttribute({
    check: function(f){
      return (f != null ? f.constructor : void 8) === Function;
    },
    join: function(f1, f2){
      return function(){
        f2.apply(this, arguments);
        return f1.apply(this, arguments);
      };
    }
  });
  metaMerger.chainFRight = metaMerger.mergeAttribute({
    right: true,
    check: function(f){
      return (f != null ? f.constructor : void 8) === Function;
    },
    join: function(f1, f2){
      return function(){
        f2.apply(this, arguments);
        return f1.apply(this, arguments);
      };
    }
  });
  metaMerger.mergeDict = metaMerger.mergeAttribute({
    right: true,
    check: function(d){
      return (d != null ? d.constructor : void 8) === Object;
    },
    join: function(d1, d2){
      return _.extend({}, d1, d2);
    }
  });
  metaMerger.mergeDictDeep = metaMerger.mergeAttribute({
    right: true,
    check: function(d){
      return (d != null ? d.constructor : void 8) === Object;
    },
    join: function(d1, d2){
      return h.extend(d1, d2);
    }
  });
  merger = exports.merger = {};
  merger.initialize = metaMerger.chainF('initialize');
  merger.defaults = metaMerger.mergeDict('defaults');
  merger.deepDefaults = metaMerger.mergeDictDeep('defaults');
  Backbone.Model.mergers = [merger.initialize, merger.defaults];
  Backbone.View.mergers = [merger.initialize];
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
}).call(this);
