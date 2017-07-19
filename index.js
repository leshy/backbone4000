(function(){
  var _, h, Backbone, SubContext, listenMethods, metaMerger, merger, slice$ = [].slice, toString$ = {}.toString;
  _ = require('underscore');
  h = require('helpers');
  Backbone = require('./jspart');
  _.extend(exports, Backbone);
  Backbone.Model.extend4000 = Backbone.View.extend4000 = Backbone.Collection.extend4000 = function(){
    var classes, classProperties, classInherit, mergers, newClass, transformers, this$ = this;
    classes = slice$.call(arguments);
    classProperties = {};
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
  listenMethods = {
    listenTo: 'on',
    listenToOnce: 'once'
  };
  _.each(listenMethods, function(implementation, method){
    return Backbone.Model.prototype[method] = function(obj, name, callback){
      var listeningTo, id;
      listeningTo = this._listeningTo || (this._listeningTo = {});
      id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') {
        callback = this;
      }
      if (obj.jquery == null) {
        obj[implementation](name, callback, this);
      } else {
        if (implementation === 'once') {
          obj.one(name, callback);
        } else {
          obj[implementation](name, callback);
        }
      }
      return this;
    };
  });
  Backbone.Model.prototype.toJSON = function(){
    var attr;
    attr = _.clone(this.attributes);
    if (this.stringifyOmit) {
      attr = _.omit(attr, this.stringifyOmit);
    }
    if (this.stringifyPick) {
      attr = _.pick(attr, this.stringifyPick);
    }
    return this.stringifyParse(attr);
  };
  Backbone.Model.prototype.stringifyParse = function(attr){
    console.log("root stringify", attr);
    return _.mapObject(attr, function(value, key){
      if (toString$.call(value).slice(8, -1) === 'Object' && value.constructor !== Object) {
        return typeof value.toJSON == 'function' ? value.toJSON() : void 8;
      } else {
        return value;
      }
    });
  };
  Backbone.Model.prototype.stopListening = function(obj, name, callback){
    var listeningTo, remove, this$ = this;
    listeningTo = this._listeningTo;
    if (!listeningTo) {
      return this;
    }
    remove = !name && !callback;
    if (!callback && typeof name === 'object') {
      callback = this;
    }
    if (obj) {
      (listeningTo = {})[obj._listenId] = obj;
    }
    _.each(listeningTo, function(obj, id){
      var ref$, ref1$;
      if (obj.jquery == null) {
        obj.off(name, callback, this$);
      } else {
        obj.off(name, callback);
      }
      if (remove || _.isEmpty(obj._events)) {
        return ref1$ = (ref$ = this$._listeningTo)[id], delete ref$[id], ref1$;
      }
    });
    return this;
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
  import$(metaMerger, {
    chainF: metaMerger.mergeAttribute({
      check: function(f){
        return (f != null ? f.constructor : void 8) === Function;
      },
      join: function(f1, f2){
        return function(){
          f2.apply(this, arguments);
          return f1.apply(this, arguments);
        };
      }
    }),
    chainFRight: metaMerger.mergeAttribute({
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
    }),
    pipeF: metaMerger.mergeAttribute({
      check: function(f){
        return (f != null ? f.constructor : void 8) === Function;
      },
      join: function(f1, f2){
        return compose$(f1, f2);
      }
    }),
    pipeFRight: metaMerger.mergeAttribute({
      right: true,
      check: function(f){
        return (f != null ? f.constructor : void 8) === Function;
      },
      join: function(f1, f2){
        return compose$(f2, f1);
      }
    }),
    mergeDict: metaMerger.mergeAttribute({
      right: true,
      check: function(d){
        return (d != null ? d.constructor : void 8) === Object;
      },
      join: function(d1, d2){
        return import$(import$({}, d1), d2);
      }
    }),
    mergeDictDeep: metaMerger.mergeAttribute({
      right: true,
      check: function(d){
        return (d != null ? d.constructor : void 8) === Object;
      },
      join: function(d1, d2){
        return h.extend(d1, d2);
      }
    })
  });
  merger = exports.merger = {
    initialize: metaMerger.chainF('initialize'),
    defaults: metaMerger.mergeDict('defaults'),
    deepDefaults: metaMerger.mergeDictDeep('defaults')
  };
  Backbone.Model.mergers = [merger.initialize, defaults, metaMerger.pipeFRight('stringifyParse')];
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
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3llbnRvd24vdHJhZGVyL25vZGVfbW9kdWxlcy9iYWNrYm9uZTQwMDAvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFFYyxDQUFaLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBO0VBQ1MsQ0FBVCxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQTtFQUdGLFFBQVMsQ0FBQSxDQUFBLENBQUUsUUFBUSxVQUFBO0VBQ25CLENBQUMsQ0FBQyxPQUFPLFNBQVMsUUFBVDtFQUVULFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQTs7SUFBSTtJQUMxRixlQUFnQixDQUFBLENBQUEsQ0FBRTtJQUVsQixPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxJQUFJLFNBQVMsUUFBQSxDQUFBLEdBQUE7O01BQ3ZCLElBQUcsQ0FBSSxHQUFQO1FBQ0UsT0FBTyxDQUFDLElBQStDLDZDQUFFLE9BQUY7UUFDdkQsR0FBSSxDQUFBLENBQUEsS0FBTSxNQUFNLHVDQUFBO1FBQ2hCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFKO1FBQ1osTUFBTSxHQUFOOztNQUNGLElBQUcsR0FBRyxDQUFBLFNBQU47UUFBYyxNQUFBLENBQU8sR0FBRyxDQUFBLFNBQVY7T0FBYTtlQUFLOztLQU5sQjtJQVFoQixZQUFhLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQSxRQUFBOztNQUNiLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFDLFlBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sU0FBUyxRQUFULENBQVIsQ0FBWDtNQUN4QixJQUFHLE9BQUg7UUFBZ0IsTUFBQSxDQUFPLGVBQWUsQ0FBQyxRQUFELENBQVcsQ0FBQSxD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UCxVQUNBLFVBQVUsQ0FBQyxXQUFXLGdCQUFELENBSEU7RUFNekIsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQ3RCLE1BQU0sQ0FBQyxVQURlIiwic291cmNlc0NvbnRlbnQiOlsiIyBhdXRvY29tcGlsZVxucmVxdWlyZSEge1xuICB1bmRlcnNjb3JlOiBfXG4gIGhlbHBlcnM6IGhcbn1cblxuQmFja2JvbmUgPSByZXF1aXJlICcuL2pzcGFydCdcbl8uZXh0ZW5kIGV4cG9ydHMsIEJhY2tib25lXG5cbkJhY2tib25lLk1vZGVsLmV4dGVuZDQwMDAgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZDQwMDAgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZDQwMDAgPSAoLi4uY2xhc3NlcykgLT5cbiAgY2xhc3NQcm9wZXJ0aWVzID0ge31cbiAgXG4gIGNsYXNzZXMgPSBfLm1hcCBjbGFzc2VzLCAoY2xzKSAtPlxuICAgIGlmIG5vdCBjbHNcbiAgICAgIGNvbnNvbGUubG9nIFwib25lIG9mIG15IGNsYXNzZXMgaXMgZW1wdHksIHdpbGwgdGhyb3c6XFxuXCIsIGNsYXNzZXNcbiAgICAgIGVyciA9IG5ldyBFcnJvciAnZXh0ZW5kNDAwMCBjYWxsZWQgd2l0aCBhbiBlbXB0eSBjbGFzcydcbiAgICAgIGNvbnNvbGUubG9nIGVyci5zdGFja1xuICAgICAgdGhyb3cgZXJyXG4gICAgaWYgY2xzOjogdGhlbiByZXR1cm4gY2xzOjogZWxzZSBjbHNcblxuICBjbGFzc0luaGVyaXQgPSAoYXR0ck5hbWUpIH4+XG4gICAgbmV3QXR0ciA9IGguZmlsdGVyRmFsc2UgKF8uZmxhdHRlbiBfLnBsdWNrIGNsYXNzZXMsIGF0dHJOYW1lKVxuICAgIGlmIG5ld0F0dHIgdGhlbiByZXR1cm4gY2xhc3NQcm9wZXJ0aWVzW2F0dHJOYW1lXSA9IGgucHVzaCBAW2F0dHJOYW1lXSwgbmV3QXR0clxuICAgIHJldHVybiBAW2F0dHJOYW1lXVxuXG4gICMgc21hcnQgY2xhc3Mgam9pbiB2aWEgbWVyZ2Vyc1xuICBtZXJnZXJzID0gY2xhc3NJbmhlcml0ICdtZXJnZXJzJ1xuICBfLm1hcCBtZXJnZXJzLCAobWVyZ2VyKSB+PiBoLnB1c2htIGNsYXNzZXMsIG1lcmdlci5jYWxsKEAsIGNsYXNzZXMuY29uY2F0KEA6OikpXG5cbiAgIyBtZXJnZSBhbGwgY2xhc3Nlc1xuICBuZXdDbGFzcyA9IF8ucmVkdWNlIGNsYXNzZXMsICgobmV3Q2xhc3MsaW5jbHVkZUNsYXNzKSAtPlxuICAgIG5ld0NsYXNzLmV4dGVuZCBpbmNsdWRlQ2xhc3MpLCBAXG5cbiAgIyBhcHBseSBtZXRhY2xhc3MgdHJhbnNmb3JtYXRpb25zXG4gIHRyYW5zZm9ybWVycyA9IGNsYXNzSW5oZXJpdCAndHJhbnNmb3JtZXJzJ1xuICBuZXdDbGFzcyA9IF8ucmVkdWNlKCAodHJhbnNmb3JtZXJzIG9yIFtdKSwgKChuZXdDbGFzcyx0cmFuc2Zvcm1lcikgfj4gdHJhbnNmb3JtZXIobmV3Q2xhc3MsQCkpLCBuZXdDbGFzcylcblxuICAjIGluaGVyaXQgY2xhc3MgcHJvcGVydGllcyAobWVyZ2VycyBhbmQgdHJhbnNmb3JtZXJzKVxuICBuZXdDbGFzcyA9IG5ld0NsYXNzLmV4dGVuZCB7fSwgY2xhc3NQcm9wZXJ0aWVzXG5cbiAgICBcblN1YkNvbnRleHQgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQ0MDAwKCByZW1vdmU6IC0+IEBzdG9wTGlzdGVuaW5nKCkgKVxuQmFja2JvbmUuTW9kZWw6OnN1YkNvbnRleHQgPSAtPiByZXR1cm4gbmV3IFN1YkNvbnRleHQoKVxuXG5saXN0ZW5NZXRob2RzID0geyBsaXN0ZW5UbzogJ29uJywgbGlzdGVuVG9PbmNlOiAnb25jZSd9O1xuXG5fLmVhY2ggbGlzdGVuTWV0aG9kcywgKGltcGxlbWVudGF0aW9uLCBtZXRob2QpIC0+XG4gIEJhY2tib25lLk1vZGVsOjpbbWV0aG9kXSA9IChvYmosIG5hbWUsIGNhbGxiYWNrKSAtPlxuICAgIGxpc3RlbmluZ1RvID0gQC5fbGlzdGVuaW5nVG8gb3IgQC5fbGlzdGVuaW5nVG8gPSB7fVxuICAgIGlkID0gb2JqLl9saXN0ZW5JZCBvciBvYmouX2xpc3RlbklkID0gXy51bmlxdWVJZCgnbCcpXG5cbiAgICBsaXN0ZW5pbmdUb1tpZF0gPSBvYmpcbiAgICBpZiBub3QgY2FsbGJhY2sgYW5kIHR5cGVvZiBuYW1lIGlzICdvYmplY3QnIHRoZW4gY2FsbGJhY2sgPSBAXG4gICAgaWYgbm90IG9iai5qcXVlcnk/IHRoZW4gb2JqW2ltcGxlbWVudGF0aW9uXSBuYW1lLCBjYWxsYmFjaywgQFxuICAgIGVsc2VcbiAgICAgIGlmIGltcGxlbWVudGF0aW9uIGlzICdvbmNlJ1xuICAgICAgICBvYmoub25lIG5hbWUsIGNhbGxiYWNrXG4gICAgICBlbHNlXG4gICAgICAgIG9ialtpbXBsZW1lbnRhdGlvbl0gbmFtZSwgY2FsbGJhY2sgICAgICBcbiAgICBAXG5cbkJhY2tib25lLk1vZGVsOjp0b0pTT04gPSAtPlxuICBhdHRyID0gXy5jbG9uZSBAYXR0cmlidXRlc1xuICBpZiBAc3RyaW5naWZ5T21pdCB0aGVuIGF0dHIgPSBfLm9taXQgYXR0ciwgQHN0cmluZ2lmeU9taXRcbiAgaWYgQHN0cmluZ2lmeVBpY2sgdGhlbiBhdHRyID0gXy5waWNrIGF0dHIsIEBzdHJpbmdpZnlQaWNrXG4gIEBzdHJpbmdpZnlQYXJzZSBhdHRyXG4gIFxuQmFja2JvbmUuTW9kZWw6OnN0cmluZ2lmeVBhcnNlID0gKGF0dHIpIC0+XG4gIGNvbnNvbGUubG9nIFwicm9vdCBzdHJpbmdpZnlcIiwgYXR0clxuICBfLm1hcE9iamVjdCBhdHRyLCAodmFsdWUsIGtleSkgLT5cbiAgICBpZiB0eXBlb2YhIHZhbHVlIGlzICdPYmplY3QnIGFuZCB2YWx1ZUBAIGlzbnQgT2JqZWN0IHRoZW4gdmFsdWUudG9KU09OPyFcbiAgICBlbHNlIHZhbHVlICBcbiAgICAgICAgICAgIFxuQmFja2JvbmUuTW9kZWw6OnN0b3BMaXN0ZW5pbmcgPSAob2JqLCBuYW1lLCBjYWxsYmFjaykgLT5cbiAgbGlzdGVuaW5nVG8gPSBAX2xpc3RlbmluZ1RvXG4gIGlmIG5vdCBsaXN0ZW5pbmdUbyB0aGVuIHJldHVybiBAXG4gIHJlbW92ZSA9IG5vdCBuYW1lIGFuZCBub3QgY2FsbGJhY2tcblxuICBpZiBub3QgY2FsbGJhY2sgYW5kIHR5cGVvZiBuYW1lIGlzICdvYmplY3QnIHRoZW4gY2FsbGJhY2sgPSBAXG4gIGlmIG9iaiB0aGVuIChsaXN0ZW5pbmdUbyA9IHt9KVtvYmouX2xpc3RlbklkXSA9IG9ialxuXG4gIF8uZWFjaCBsaXN0ZW5pbmdUbywgKG9iaiwgaWQpIH4+IFxuICAgIGlmIG5vdCBvYmouanF1ZXJ5PyB0aGVuIG9iai5vZmYgbmFtZSwgY2FsbGJhY2ssIEBcbiAgICBlbHNlIG9iai5vZmYgbmFtZSwgY2FsbGJhY2tcblxuICAgIGlmIHJlbW92ZSBvciBfLmlzRW1wdHkob2JqLl9ldmVudHMpIHRoZW4gZGVsZXRlIEBfbGlzdGVuaW5nVG9baWRdXG4gIEBcblxuXG4jXG4jIG1ldGFNZXJnZXJzIGFyZSB0aGUgY29yZSBvZiB0aGlzIG9iamVjdCBtb2RlbHMgbXVsdGlwbGUgaW5oZXJpdGFuY2Ugc3lzdGVtXG4jIFxuIyB0aGV5IGRlZmluZSB0aGUgd2F5IG11bHRpcGxlIGNsYXNzZXMgY29tYmluZSB0aGVtc2VsdmVzIHRoZSBmaW5hbCBjbGFzc1xuI1xuIyBtZXRob2RzIGFuZCBhdHRyaWJ1dGVzIGFyZSBub3QgbmVjY2Vzc2FyaWx5IGp1c3QgcmVwbGFjZWQgYnkgYSB0b3AgbGV2ZWwgZGVmaW5pdGlvbiBidXQgY2hhaW5lZCwgcGlwZWQsIHJlcGxhY2VkLCBhZGRlZCwgb3IgcGFyc2VkIGluIGFyYml0cmFyeSB3YXlzIGludG8gdGhlIGZpbmFsIGNsYXNzIG1ldGhvZHMgYW5kIGF0dHJpYnV0ZXNcbiMgc3VwcG9ydHMgY29uZmlndXJpbmcgdGhlIG1lcmdlcnMgZnJvbSB0aGUgY29uc3RydWN0b3IgZGVmaW5pdGlvbnMgdGhlbXNlbHZlcyBhbmQgbWVyZ2UgcG9zdHByb2Nlc3NpbmdcbiNcbiMgZm9yIGV4YW1wbGUsIGZvciB0aGUgZGVmYXVsdCBtb2RlbCxcbiMgXCJkZWZhdWx0c1wiIE9iamVjdCBhdHRyaWJ1dGUgaXMgbWVyZ2VkIGZyb20gc3VwZXJjbGFzc2VzXG4jIFwiaW5pdGlhbGl6ZVwiIGZ1bmN0aW9ucyBhcmUgcmFuIG9uZSBhZnRlciB0aGUgb3RoZXJcbiMgXCJzdHJpbmdpZnlQYXJzZVwiIGZ1bmN0aW9ucyBhcmUgcGlwZWQgaW50byBlYWNoIG90aGVyXG4jXG4jIGNoZWNrIGh0dHBzOi8vZ2l0aHViLmNvbS9sZXNoeS9hYnN0cmFjdG1hbi9ibG9iL21hc3Rlci9ncmFwaC5scyBmb3IgYW4gYWR2YW5jZWQgdXNlIGNhc2VcbiMgXG5cbm1ldGFNZXJnZXIgPSBleHBvcnRzLm1ldGFNZXJnZXIgPSB7fVxuXG5tZXRhTWVyZ2VyLml0ZXJhdGl2ZSA9IChvcHRpb25zLCBhdHRyTmFtZSkgLS0+XG4gIChjbGFzc2VzKSAtPlxuICAgIHsgcmlnaHQgPSBmYWxzZSwgY2hlY2ssIGpvaW4sIHBvc3RKb2luIH0gPSBvcHRpb25zXG4gICAgaWYgcmlnaHQgdGhlbiBpdGVyRiA9IF8ucmVkdWNlUmlnaHQgZWxzZSBpdGVyRiA9IF8ucmVkdWNlXG4gICAgICBcbiAgICBqb2luZWRBdHRyaWJ1dGUgPSBpdGVyRiBjbGFzc2VzLCAoKGpvaW5lZCwgY2xzKSAtPlxuICAgICAgYXR0ciA9IGNsc1thdHRyTmFtZV1cbiAgICAgIGlmIG5vdCBjaGVjayBvciBjaGVjayBhdHRyXG4gICAgICAgIGlmIGpvaW5lZCB0aGVuIGpvaW4oam9pbmVkLCBhdHRyKSBlbHNlIGF0dHJcbiAgICAgIGVsc2Ugam9pbmVkKSwgdm9pZFxuXG4gICAgaWYgam9pbmVkQXR0cmlidXRlXG4gICAgICByZXQgPSB7fVxuICAgICAgcmV0W2F0dHJOYW1lXSA9IGpvaW5lZEF0dHJpYnV0ZVxuICAgICAgXG4gICAgICAjIHBvc3Rwcm9jZXNzaW5nP1xuICAgICAgaWYgcG9zdEpvaW4gdGhlbiBwb3N0Sm9pbiByZXQsIGF0dHJOYW1lLCBvcHRpb25zXG4gICAgICBlbHNlIHJldFxuICAgICAgXG4gICAgZWxzZSB2b2lkXG5cbm1ldGFNZXJnZXIubWVyZ2VBdHRyaWJ1dGVMZWZ0ID0gbWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZSA9IG1ldGFNZXJnZXIuaXRlcmF0aXZlXG5cbm1ldGFNZXJnZXIgPDw8IGRvXG4gIGNoYWluRjpcbiAgICBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlIGRvXG4gICAgICBjaGVjazogKChmKSAtPiBmP0BAIGlzIEZ1bmN0aW9uKVxuICAgICAgam9pbjogKChmMSwgZjIpIC0+IC0+IGYyKC4uLik7IGYxKC4uLikpXG4gIFxuICBjaGFpbkZSaWdodDpcbiAgICBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlIGRvXG4gICAgICByaWdodDogdHJ1ZVxuICAgICAgY2hlY2s6ICgoZikgLT4gZj9AQCBpcyBGdW5jdGlvbilcbiAgICAgIGpvaW46ICgoZjEsIGYyKSAtPiAtPiBmMiguLi4pOyBmMSguLi4pKSAgXG5cbiAgcGlwZUY6XG4gICAgbWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZSBkb1xuICAgICAgY2hlY2s6ICgoZikgLT4gZj9AQCBpcyBGdW5jdGlvbilcbiAgICAgIGpvaW46ICgoZjEsIGYyKSAtPiBmMiA8PCBmMSlcbiAgXG4gIHBpcGVGUmlnaHQ6XG4gICAgbWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZSBkb1xuICAgICAgcmlnaHQ6IHRydWVcbiAgICAgIGNoZWNrOiAoKGYpIC0+IGY/QEAgaXMgRnVuY3Rpb24pXG4gICAgICBqb2luOiAoKGYxLCBmMikgLT4gZjEgPDwgZjIpICBcblxuICBtZXJnZURpY3Q6XG4gICAgbWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZSBkb1xuICAgICAgcmlnaHQ6IHRydWVcbiAgICAgIGNoZWNrOiAoKGQpIC0+IGQ/QEAgaXMgT2JqZWN0KVxuICAgICAgam9pbjogKGQxLCBkMikgLT4ge30gPDw8IGQxIDw8PCBkMlxuICBcbiAgbWVyZ2VEaWN0RGVlcDpcbiAgICBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlIGRvXG4gICAgICByaWdodDogdHJ1ZSwgY2hlY2s6ICgoZCkgLT4gZD9AQCBpcyBPYmplY3QpXG4gICAgICBqb2luOiAoZDEsIGQyKSAtPiBoLmV4dGVuZCBkMSwgZDJcblxubWVyZ2VyID0gZXhwb3J0cy5tZXJnZXIgPSBkb1xuICBpbml0aWFsaXplOiBtZXRhTWVyZ2VyLmNoYWluRiAnaW5pdGlhbGl6ZSdcbiAgZGVmYXVsdHM6IG1ldGFNZXJnZXIubWVyZ2VEaWN0ICdkZWZhdWx0cydcbiAgZGVlcERlZmF1bHRzOiBtZXRhTWVyZ2VyLm1lcmdlRGljdERlZXAgJ2RlZmF1bHRzJ1xuXG5CYWNrYm9uZS5Nb2RlbC5tZXJnZXJzID0gW1xuICBtZXJnZXIuaW5pdGlhbGl6ZVxuICBkZWZhdWx0c1xuICBtZXRhTWVyZ2VyLnBpcGVGUmlnaHQoJ3N0cmluZ2lmeVBhcnNlJylcbl1cblxuQmFja2JvbmUuVmlldy5tZXJnZXJzID0gW1xuICBtZXJnZXIuaW5pdGlhbGl6ZVxuXVxuXG5cbiJdfQ==
