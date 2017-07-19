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
  merger = exports.merger = {};
  merger.initialize = metaMerger.chainF('initialize');
  merger.defaults = metaMerger.mergeDict('defaults');
  merger.deepDefaults = metaMerger.mergeDictDeep('defaults');
  merger.stringifyParse = metaMerger.pipeFRight('stringifyParse');
  Backbone.Model.mergers = [merger.initialize, merger.defaults, merger.stringifyParse];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3llbnRvd24vdHJhZGVyL25vZGVfbW9kdWxlcy9iYWNrYm9uZTQwMDAvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFFYyxDQUFaLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBO0VBQ1MsQ0FBVCxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQTtFQUdGLFFBQVMsQ0FBQSxDQUFBLENBQUUsUUFBUSxVQUFBO0VBQ25CLENBQUMsQ0FBQyxPQUFPLFNBQVMsUUFBVDtFQUVULFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQTs7SUFBSTtJQUMxRixlQUFnQixDQUFBLENBQUEsQ0FBRTtJQUVsQixPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxJQUFJLFNBQVMsUUFBQSxDQUFBLEdBQUE7O01BQ3ZCLElBQUcsQ0FBSSxHQUFQO1FBQ0UsT0FBTyxDQUFDLElBQStDLDZDQUFFLE9BQUY7UUFDdkQsR0FBSSxDQUFBLENBQUEsS0FBTSxNQUFNLHVDQUFBO1FBQ2hCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFKO1FBQ1osTUFBTSxHQUFOOztNQUNGLElBQUcsR0FBRyxDQUFBLFNBQU47UUFBYyxNQUFBLENBQU8sR0FBRyxDQUFBLFNBQVY7T0FBYTtlQUFLOztLQU5sQjtJQVFoQixZQUFhLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQSxRQUFBOztNQUNiLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFDLFlBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sU0FBUyxRQUFULENBQVIsQ0FBWDtNQUN4QixJQUFHLE9BQUg7UUFBZ0IsTUFBQSxDQUFPLGVBQWUsQ0FBQyxRQUFELENBQVcsQ0FBQSxD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QUFBO0VBQy9DLE1BQU0sQ0FBQyxjQUFlLENBQUEsQ0FBQSxDQUFFLFVBQVUsQ0FBQyxXQUFXLGdCQUFBO0VBRTlDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFFLE1BQU0sQ0FBQyxZQUFZLE1BQU0sQ0FBQyxVQUFVLE1BQU0sQ0FBQyxjQUE3QztFQUN6QixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBRSxNQUFNLENBQUMsVUFBVCIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcbnJlcXVpcmUhIHtcbiAgdW5kZXJzY29yZTogX1xuICBoZWxwZXJzOiBoXG59XG5cbkJhY2tib25lID0gcmVxdWlyZSAnLi9qc3BhcnQnXG5fLmV4dGVuZCBleHBvcnRzLCBCYWNrYm9uZVxuXG5CYWNrYm9uZS5Nb2RlbC5leHRlbmQ0MDAwID0gQmFja2JvbmUuVmlldy5leHRlbmQ0MDAwID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQ0MDAwID0gKC4uLmNsYXNzZXMpIC0+XG4gIGNsYXNzUHJvcGVydGllcyA9IHt9XG4gIFxuICBjbGFzc2VzID0gXy5tYXAgY2xhc3NlcywgKGNscykgLT5cbiAgICBpZiBub3QgY2xzXG4gICAgICBjb25zb2xlLmxvZyBcIm9uZSBvZiBteSBjbGFzc2VzIGlzIGVtcHR5LCB3aWxsIHRocm93OlxcblwiLCBjbGFzc2VzXG4gICAgICBlcnIgPSBuZXcgRXJyb3IgJ2V4dGVuZDQwMDAgY2FsbGVkIHdpdGggYW4gZW1wdHkgY2xhc3MnXG4gICAgICBjb25zb2xlLmxvZyBlcnIuc3RhY2tcbiAgICAgIHRocm93IGVyclxuICAgIGlmIGNsczo6IHRoZW4gcmV0dXJuIGNsczo6IGVsc2UgY2xzXG5cbiAgY2xhc3NJbmhlcml0ID0gKGF0dHJOYW1lKSB+PlxuICAgIG5ld0F0dHIgPSBoLmZpbHRlckZhbHNlIChfLmZsYXR0ZW4gXy5wbHVjayBjbGFzc2VzLCBhdHRyTmFtZSlcbiAgICBpZiBuZXdBdHRyIHRoZW4gcmV0dXJuIGNsYXNzUHJvcGVydGllc1thdHRyTmFtZV0gPSBoLnB1c2ggQFthdHRyTmFtZV0sIG5ld0F0dHJcbiAgICByZXR1cm4gQFthdHRyTmFtZV1cblxuICAjIHNtYXJ0IGNsYXNzIGpvaW4gdmlhIG1lcmdlcnNcbiAgbWVyZ2VycyA9IGNsYXNzSW5oZXJpdCAnbWVyZ2VycydcbiAgXy5tYXAgbWVyZ2VycywgKG1lcmdlcikgfj4gaC5wdXNobSBjbGFzc2VzLCBtZXJnZXIuY2FsbChALCBjbGFzc2VzLmNvbmNhdChAOjopKVxuXG4gICMgbWVyZ2UgYWxsIGNsYXNzZXNcbiAgbmV3Q2xhc3MgPSBfLnJlZHVjZSBjbGFzc2VzLCAoKG5ld0NsYXNzLGluY2x1ZGVDbGFzcykgLT5cbiAgICBuZXdDbGFzcy5leHRlbmQgaW5jbHVkZUNsYXNzKSwgQFxuXG4gICMgYXBwbHkgbWV0YWNsYXNzIHRyYW5zZm9ybWF0aW9uc1xuICB0cmFuc2Zvcm1lcnMgPSBjbGFzc0luaGVyaXQgJ3RyYW5zZm9ybWVycydcbiAgbmV3Q2xhc3MgPSBfLnJlZHVjZSggKHRyYW5zZm9ybWVycyBvciBbXSksICgobmV3Q2xhc3MsdHJhbnNmb3JtZXIpIH4+IHRyYW5zZm9ybWVyKG5ld0NsYXNzLEApKSwgbmV3Q2xhc3MpXG5cbiAgIyBpbmhlcml0IGNsYXNzIHByb3BlcnRpZXMgKG1lcmdlcnMgYW5kIHRyYW5zZm9ybWVycylcbiAgbmV3Q2xhc3MgPSBuZXdDbGFzcy5leHRlbmQge30sIGNsYXNzUHJvcGVydGllc1xuXG4gICAgXG5TdWJDb250ZXh0ID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kNDAwMCggcmVtb3ZlOiAtPiBAc3RvcExpc3RlbmluZygpIClcbkJhY2tib25lLk1vZGVsOjpzdWJDb250ZXh0ID0gLT4gcmV0dXJuIG5ldyBTdWJDb250ZXh0KClcblxubGlzdGVuTWV0aG9kcyA9IHsgbGlzdGVuVG86ICdvbicsIGxpc3RlblRvT25jZTogJ29uY2UnfTtcblxuXy5lYWNoIGxpc3Rlbk1ldGhvZHMsIChpbXBsZW1lbnRhdGlvbiwgbWV0aG9kKSAtPlxuICBCYWNrYm9uZS5Nb2RlbDo6W21ldGhvZF0gPSAob2JqLCBuYW1lLCBjYWxsYmFjaykgLT5cbiAgICBsaXN0ZW5pbmdUbyA9IEAuX2xpc3RlbmluZ1RvIG9yIEAuX2xpc3RlbmluZ1RvID0ge31cbiAgICBpZCA9IG9iai5fbGlzdGVuSWQgb3Igb2JqLl9saXN0ZW5JZCA9IF8udW5pcXVlSWQoJ2wnKVxuXG4gICAgbGlzdGVuaW5nVG9baWRdID0gb2JqXG4gICAgaWYgbm90IGNhbGxiYWNrIGFuZCB0eXBlb2YgbmFtZSBpcyAnb2JqZWN0JyB0aGVuIGNhbGxiYWNrID0gQFxuICAgIGlmIG5vdCBvYmouanF1ZXJ5PyB0aGVuIG9ialtpbXBsZW1lbnRhdGlvbl0gbmFtZSwgY2FsbGJhY2ssIEBcbiAgICBlbHNlXG4gICAgICBpZiBpbXBsZW1lbnRhdGlvbiBpcyAnb25jZSdcbiAgICAgICAgb2JqLm9uZSBuYW1lLCBjYWxsYmFja1xuICAgICAgZWxzZVxuICAgICAgICBvYmpbaW1wbGVtZW50YXRpb25dIG5hbWUsIGNhbGxiYWNrICAgICAgXG4gICAgQFxuXG5CYWNrYm9uZS5Nb2RlbDo6dG9KU09OID0gLT5cbiAgYXR0ciA9IF8uY2xvbmUgQGF0dHJpYnV0ZXNcbiAgaWYgQHN0cmluZ2lmeU9taXQgdGhlbiBhdHRyID0gXy5vbWl0IGF0dHIsIEBzdHJpbmdpZnlPbWl0XG4gIGlmIEBzdHJpbmdpZnlQaWNrIHRoZW4gYXR0ciA9IF8ucGljayBhdHRyLCBAc3RyaW5naWZ5UGlja1xuICBAc3RyaW5naWZ5UGFyc2UgYXR0clxuICBcbkJhY2tib25lLk1vZGVsOjpzdHJpbmdpZnlQYXJzZSA9IChhdHRyKSAtPlxuICBjb25zb2xlLmxvZyBcInJvb3Qgc3RyaW5naWZ5XCIsIGF0dHJcbiAgXy5tYXBPYmplY3QgYXR0ciwgKHZhbHVlLCBrZXkpIC0+XG4gICAgaWYgdHlwZW9mISB2YWx1ZSBpcyAnT2JqZWN0JyBhbmQgdmFsdWVAQCBpc250IE9iamVjdCB0aGVuIHZhbHVlLnRvSlNPTj8hXG4gICAgZWxzZSB2YWx1ZSAgXG4gICAgICAgICAgICBcbkJhY2tib25lLk1vZGVsOjpzdG9wTGlzdGVuaW5nID0gKG9iaiwgbmFtZSwgY2FsbGJhY2spIC0+XG4gIGxpc3RlbmluZ1RvID0gQF9saXN0ZW5pbmdUb1xuICBpZiBub3QgbGlzdGVuaW5nVG8gdGhlbiByZXR1cm4gQFxuICByZW1vdmUgPSBub3QgbmFtZSBhbmQgbm90IGNhbGxiYWNrXG5cbiAgaWYgbm90IGNhbGxiYWNrIGFuZCB0eXBlb2YgbmFtZSBpcyAnb2JqZWN0JyB0aGVuIGNhbGxiYWNrID0gQFxuICBpZiBvYmogdGhlbiAobGlzdGVuaW5nVG8gPSB7fSlbb2JqLl9saXN0ZW5JZF0gPSBvYmpcblxuICBfLmVhY2ggbGlzdGVuaW5nVG8sIChvYmosIGlkKSB+PiBcbiAgICBpZiBub3Qgb2JqLmpxdWVyeT8gdGhlbiBvYmoub2ZmIG5hbWUsIGNhbGxiYWNrLCBAXG4gICAgZWxzZSBvYmoub2ZmIG5hbWUsIGNhbGxiYWNrXG5cbiAgICBpZiByZW1vdmUgb3IgXy5pc0VtcHR5KG9iai5fZXZlbnRzKSB0aGVuIGRlbGV0ZSBAX2xpc3RlbmluZ1RvW2lkXVxuICBAXG5cbm1ldGFNZXJnZXIgPSBleHBvcnRzLm1ldGFNZXJnZXIgPSB7fVxuXG5tZXRhTWVyZ2VyLml0ZXJhdGl2ZSA9IChvcHRpb25zLCBhdHRyTmFtZSkgLS0+XG4gIChjbGFzc2VzKSAtPlxuICAgIHsgcmlnaHQgPSBmYWxzZSwgY2hlY2ssIGpvaW4sIHBvc3RKb2luIH0gPSBvcHRpb25zXG4gICAgaWYgcmlnaHQgdGhlbiBpdGVyRiA9IF8ucmVkdWNlUmlnaHQgZWxzZSBpdGVyRiA9IF8ucmVkdWNlXG4gICAgICBcbiAgICBqb2luZWRBdHRyaWJ1dGUgPSBpdGVyRiBjbGFzc2VzLCAoKGpvaW5lZCwgY2xzKSAtPlxuICAgICAgYXR0ciA9IGNsc1thdHRyTmFtZV1cbiAgICAgIGlmIG5vdCBjaGVjayBvciBjaGVjayBhdHRyXG4gICAgICAgIGlmIGpvaW5lZCB0aGVuIGpvaW4oam9pbmVkLCBhdHRyKSBlbHNlIGF0dHJcbiAgICAgIGVsc2Ugam9pbmVkKSwgdm9pZFxuXG4gICAgaWYgam9pbmVkQXR0cmlidXRlXG4gICAgICByZXQgPSB7fVxuICAgICAgcmV0W2F0dHJOYW1lXSA9IGpvaW5lZEF0dHJpYnV0ZVxuICAgICAgXG4gICAgICAjIHBvc3Rwcm9jZXNzaW5nP1xuICAgICAgaWYgcG9zdEpvaW4gdGhlbiBwb3N0Sm9pbiByZXQsIGF0dHJOYW1lLCBvcHRpb25zXG4gICAgICBlbHNlIHJldFxuICAgICAgXG4gICAgZWxzZSB2b2lkXG5cbm1ldGFNZXJnZXIubWVyZ2VBdHRyaWJ1dGVMZWZ0ID0gbWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZSA9IG1ldGFNZXJnZXIuaXRlcmF0aXZlXG5cbm1ldGFNZXJnZXIgPDw8IGRvXG4gIGNoYWluRjpcbiAgICBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlIGRvXG4gICAgICBjaGVjazogKChmKSAtPiBmP0BAIGlzIEZ1bmN0aW9uKVxuICAgICAgam9pbjogKChmMSwgZjIpIC0+IC0+IGYyKC4uLik7IGYxKC4uLikpXG4gIFxuICBjaGFpbkZSaWdodDpcbiAgICBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlIGRvXG4gICAgICByaWdodDogdHJ1ZVxuICAgICAgY2hlY2s6ICgoZikgLT4gZj9AQCBpcyBGdW5jdGlvbilcbiAgICAgIGpvaW46ICgoZjEsIGYyKSAtPiAtPiBmMiguLi4pOyBmMSguLi4pKSAgXG5cbiAgcGlwZUY6XG4gICAgbWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZSBkb1xuICAgICAgY2hlY2s6ICgoZikgLT4gZj9AQCBpcyBGdW5jdGlvbilcbiAgICAgIGpvaW46ICgoZjEsIGYyKSAtPiBmMiA8PCBmMSlcbiAgXG4gIHBpcGVGUmlnaHQ6XG4gICAgbWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZSBkb1xuICAgICAgcmlnaHQ6IHRydWVcbiAgICAgIGNoZWNrOiAoKGYpIC0+IGY/QEAgaXMgRnVuY3Rpb24pXG4gICAgICBqb2luOiAoKGYxLCBmMikgLT4gZjEgPDwgZjIpICBcblxuICBtZXJnZURpY3Q6XG4gICAgbWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZSBkb1xuICAgICAgcmlnaHQ6IHRydWVcbiAgICAgIGNoZWNrOiAoKGQpIC0+IGQ/QEAgaXMgT2JqZWN0KVxuICAgICAgam9pbjogKGQxLCBkMikgLT4ge30gPDw8IGQxIDw8PCBkMlxuICBcbiAgbWVyZ2VEaWN0RGVlcDpcbiAgICBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlIGRvXG4gICAgICByaWdodDogdHJ1ZSwgY2hlY2s6ICgoZCkgLT4gZD9AQCBpcyBPYmplY3QpXG4gICAgICBqb2luOiAoZDEsIGQyKSAtPiBoLmV4dGVuZCBkMSwgZDJcblxubWVyZ2VyID0gZXhwb3J0cy5tZXJnZXIgPSB7fVxuXG5tZXJnZXIuaW5pdGlhbGl6ZSA9IG1ldGFNZXJnZXIuY2hhaW5GICdpbml0aWFsaXplJ1xubWVyZ2VyLmRlZmF1bHRzID0gbWV0YU1lcmdlci5tZXJnZURpY3QgJ2RlZmF1bHRzJ1xubWVyZ2VyLmRlZXBEZWZhdWx0cyA9IG1ldGFNZXJnZXIubWVyZ2VEaWN0RGVlcCAnZGVmYXVsdHMnXG5tZXJnZXIuc3RyaW5naWZ5UGFyc2UgPSBtZXRhTWVyZ2VyLnBpcGVGUmlnaHQgJ3N0cmluZ2lmeVBhcnNlJ1xuXG5CYWNrYm9uZS5Nb2RlbC5tZXJnZXJzID0gWyBtZXJnZXIuaW5pdGlhbGl6ZSwgbWVyZ2VyLmRlZmF1bHRzLCBtZXJnZXIuc3RyaW5naWZ5UGFyc2UgXVxuQmFja2JvbmUuVmlldy5tZXJnZXJzID0gWyBtZXJnZXIuaW5pdGlhbGl6ZSBdXG5cblxuIl19
