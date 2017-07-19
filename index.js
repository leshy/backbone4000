(function(){
  var _, h, Backbone, SubContext, listenMethods, metaMerger, merger, slice$ = [].slice;
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
    attr = this.attributes;
    if (this.stringifyOmit) {
      attr = _.omit(attr, this.stringifyOmit);
    }
    if (this.stringifyPick) {
      attr = _.pick(attr, this.stringifyPick);
    }
    return this.stringifyParse(attr);
  };
  Backbone.Model.prototype.stringifyParse = function(attr){
    return _.mapObject(attr, function(value, key){
      if (value instanceof Object && value.constructor !== Object) {
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
  metaMerger.pipeF = metaMerger.mergeAttribute({
    right: true,
    check: function(f){
      return (f != null ? f.constructor : void 8) === Function;
    },
    join: function(f1, f2){
      return compose$(f1, f2);
    }
  });
  metaMerger.pipeFRight = metaMerger.mergeAttribute({
    right: true,
    check: function(f){
      return (f != null ? f.constructor : void 8) === Function;
    },
    join: function(f1, f2){
      return compose$(f2, f1);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3llbnRvd24vdHJhZGVyL25vZGVfbW9kdWxlcy9iYWNrYm9uZTQwMDAvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFFYyxDQUFaLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBO0VBQ1MsQ0FBVCxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQTtFQUdGLFFBQVMsQ0FBQSxDQUFBLENBQUUsUUFBUSxVQUFBO0VBQ25CLENBQUMsQ0FBQyxPQUFPLFNBQVMsUUFBVDtFQUVULFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQTs7SUFBSTtJQUMxRixlQUFnQixDQUFBLENBQUEsQ0FBRTtJQUVsQixPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxJQUFJLFNBQVMsUUFBQSxDQUFBLEdBQUE7O01BQ3ZCLElBQUcsQ0FBSSxHQUFQO1FBQ0UsT0FBTyxDQUFDLElBQStDLDZDQUFFLE9BQUY7UUFDdkQsR0FBSSxDQUFBLENBQUEsS0FBTSxNQUFNLHVDQUFBO1FBQ2hCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFKO1FBQ1osTUFBTSxHQUFOOztNQUNGLElBQUcsR0FBRyxDQUFBLFNBQU47UUFBYyxNQUFBLENBQU8sR0FBRyxDQUFBLFNBQVY7T0FBYTtlQUFLOztLQU5sQjtJQVFoQixZQUFhLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQSxRQUFBOztNQUNiLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFDLFlBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sU0FBUyxRQUFULENBQVIsQ0FBWDtNQUN4QixJQUFHLE9BQUg7UUFBZ0IsTUFBQSxDQUFPLGVBQWUsQ0FBQyxRQUFELENBQVcsQ0FBQSxD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LFFBQVMsQ0FBQSxDQUFBLENBQUUsVUFBVSxDQUFDLFVBQVUsVUFBQTtFQUN2QyxNQUFNLENBQUMsWUFBYSxDQUFBLENBQUEsQ0FBRSxVQUFVLENBQUMsY0FBYyxVQUFBO0VBQy9DLE1BQU0sQ0FBQyxjQUFlLENBQUEsQ0FBQSxDQUFFLFVBQVUsQ0FBQyxXQUFXLGdCQUFBO0VBRTlDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFFLE1BQU0sQ0FBQyxZQUFZLE1BQU0sQ0FBQyxVQUFVLE1BQU0sQ0FBQyxjQUE3QztFQUN6QixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBRSxNQUFNLENBQUMsVUFBVCIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcbnJlcXVpcmUhIHtcbiAgdW5kZXJzY29yZTogX1xuICBoZWxwZXJzOiBoXG59XG5cbkJhY2tib25lID0gcmVxdWlyZSAnLi9qc3BhcnQnXG5fLmV4dGVuZCBleHBvcnRzLCBCYWNrYm9uZVxuXG5CYWNrYm9uZS5Nb2RlbC5leHRlbmQ0MDAwID0gQmFja2JvbmUuVmlldy5leHRlbmQ0MDAwID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQ0MDAwID0gKC4uLmNsYXNzZXMpIC0+XG4gIGNsYXNzUHJvcGVydGllcyA9IHt9XG4gIFxuICBjbGFzc2VzID0gXy5tYXAgY2xhc3NlcywgKGNscykgLT5cbiAgICBpZiBub3QgY2xzXG4gICAgICBjb25zb2xlLmxvZyBcIm9uZSBvZiBteSBjbGFzc2VzIGlzIGVtcHR5LCB3aWxsIHRocm93OlxcblwiLCBjbGFzc2VzXG4gICAgICBlcnIgPSBuZXcgRXJyb3IgJ2V4dGVuZDQwMDAgY2FsbGVkIHdpdGggYW4gZW1wdHkgY2xhc3MnXG4gICAgICBjb25zb2xlLmxvZyBlcnIuc3RhY2tcbiAgICAgIHRocm93IGVyclxuICAgIGlmIGNsczo6IHRoZW4gcmV0dXJuIGNsczo6IGVsc2UgY2xzXG5cbiAgY2xhc3NJbmhlcml0ID0gKGF0dHJOYW1lKSB+PlxuICAgIG5ld0F0dHIgPSBoLmZpbHRlckZhbHNlIChfLmZsYXR0ZW4gXy5wbHVjayBjbGFzc2VzLCBhdHRyTmFtZSlcbiAgICBpZiBuZXdBdHRyIHRoZW4gcmV0dXJuIGNsYXNzUHJvcGVydGllc1thdHRyTmFtZV0gPSBoLnB1c2ggQFthdHRyTmFtZV0sIG5ld0F0dHJcbiAgICByZXR1cm4gQFthdHRyTmFtZV1cblxuICAjIHNtYXJ0IGNsYXNzIGpvaW4gdmlhIG1lcmdlcnNcbiAgbWVyZ2VycyA9IGNsYXNzSW5oZXJpdCAnbWVyZ2VycydcbiAgXy5tYXAgbWVyZ2VycywgKG1lcmdlcikgfj4gaC5wdXNobSBjbGFzc2VzLCBtZXJnZXIuY2FsbChALCBjbGFzc2VzLmNvbmNhdChAOjopKVxuXG4gICMgbWVyZ2UgYWxsIGNsYXNzZXNcbiAgbmV3Q2xhc3MgPSBfLnJlZHVjZSBjbGFzc2VzLCAoKG5ld0NsYXNzLGluY2x1ZGVDbGFzcykgLT5cbiAgICBuZXdDbGFzcy5leHRlbmQgaW5jbHVkZUNsYXNzKSwgQFxuXG4gICMgYXBwbHkgbWV0YWNsYXNzIHRyYW5zZm9ybWF0aW9uc1xuICB0cmFuc2Zvcm1lcnMgPSBjbGFzc0luaGVyaXQgJ3RyYW5zZm9ybWVycydcbiAgbmV3Q2xhc3MgPSBfLnJlZHVjZSggKHRyYW5zZm9ybWVycyBvciBbXSksICgobmV3Q2xhc3MsdHJhbnNmb3JtZXIpIH4+IHRyYW5zZm9ybWVyKG5ld0NsYXNzLEApKSwgbmV3Q2xhc3MpXG5cbiAgIyBpbmhlcml0IGNsYXNzIHByb3BlcnRpZXMgKG1lcmdlcnMgYW5kIHRyYW5zZm9ybWVycylcbiAgbmV3Q2xhc3MgPSBuZXdDbGFzcy5leHRlbmQge30sIGNsYXNzUHJvcGVydGllc1xuXG4gICAgXG5TdWJDb250ZXh0ID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kNDAwMCggcmVtb3ZlOiAtPiBAc3RvcExpc3RlbmluZygpIClcbkJhY2tib25lLk1vZGVsOjpzdWJDb250ZXh0ID0gLT4gcmV0dXJuIG5ldyBTdWJDb250ZXh0KClcblxubGlzdGVuTWV0aG9kcyA9IHsgbGlzdGVuVG86ICdvbicsIGxpc3RlblRvT25jZTogJ29uY2UnfTtcblxuXy5lYWNoIGxpc3Rlbk1ldGhvZHMsIChpbXBsZW1lbnRhdGlvbiwgbWV0aG9kKSAtPlxuICBCYWNrYm9uZS5Nb2RlbDo6W21ldGhvZF0gPSAob2JqLCBuYW1lLCBjYWxsYmFjaykgLT5cbiAgICBsaXN0ZW5pbmdUbyA9IEAuX2xpc3RlbmluZ1RvIG9yIEAuX2xpc3RlbmluZ1RvID0ge31cbiAgICBpZCA9IG9iai5fbGlzdGVuSWQgb3Igb2JqLl9saXN0ZW5JZCA9IF8udW5pcXVlSWQoJ2wnKVxuXG4gICAgbGlzdGVuaW5nVG9baWRdID0gb2JqXG4gICAgaWYgbm90IGNhbGxiYWNrIGFuZCB0eXBlb2YgbmFtZSBpcyAnb2JqZWN0JyB0aGVuIGNhbGxiYWNrID0gQFxuICAgIGlmIG5vdCBvYmouanF1ZXJ5PyB0aGVuIG9ialtpbXBsZW1lbnRhdGlvbl0gbmFtZSwgY2FsbGJhY2ssIEBcbiAgICBlbHNlXG4gICAgICBpZiBpbXBsZW1lbnRhdGlvbiBpcyAnb25jZSdcbiAgICAgICAgb2JqLm9uZSBuYW1lLCBjYWxsYmFja1xuICAgICAgZWxzZVxuICAgICAgICBvYmpbaW1wbGVtZW50YXRpb25dIG5hbWUsIGNhbGxiYWNrICAgICAgXG4gICAgQFxuXG5CYWNrYm9uZS5Nb2RlbDo6dG9KU09OID0gLT5cbiAgYXR0ciA9IEBhdHRyaWJ1dGVzXG4gIFxuICBpZiBAc3RyaW5naWZ5T21pdCB0aGVuIGF0dHIgPSBfLm9taXQgYXR0ciwgQHN0cmluZ2lmeU9taXRcbiAgaWYgQHN0cmluZ2lmeVBpY2sgdGhlbiBhdHRyID0gXy5waWNrIGF0dHIsIEBzdHJpbmdpZnlQaWNrXG4gICAgXG4gIEBzdHJpbmdpZnlQYXJzZSBhdHRyXG4gIFxuQmFja2JvbmUuTW9kZWw6OnN0cmluZ2lmeVBhcnNlID0gKGF0dHIpIC0+XG4gIF8ubWFwT2JqZWN0IGF0dHIsICh2YWx1ZSwga2V5KSAtPlxuICAgIGlmIHZhbHVlIGluc3RhbmNlb2YgT2JqZWN0IGFuZCB2YWx1ZUBAIGlzbnQgT2JqZWN0IHRoZW4gdmFsdWUudG9KU09OPyFcbiAgICBlbHNlIHZhbHVlICBcbiAgICAgICAgICAgIFxuQmFja2JvbmUuTW9kZWw6OnN0b3BMaXN0ZW5pbmcgPSAob2JqLCBuYW1lLCBjYWxsYmFjaykgLT5cbiAgbGlzdGVuaW5nVG8gPSBAX2xpc3RlbmluZ1RvXG4gIGlmIG5vdCBsaXN0ZW5pbmdUbyB0aGVuIHJldHVybiBAXG4gIHJlbW92ZSA9IG5vdCBuYW1lIGFuZCBub3QgY2FsbGJhY2tcblxuICBpZiBub3QgY2FsbGJhY2sgYW5kIHR5cGVvZiBuYW1lIGlzICdvYmplY3QnIHRoZW4gY2FsbGJhY2sgPSBAXG4gIGlmIG9iaiB0aGVuIChsaXN0ZW5pbmdUbyA9IHt9KVtvYmouX2xpc3RlbklkXSA9IG9ialxuXG4gIF8uZWFjaCBsaXN0ZW5pbmdUbywgKG9iaiwgaWQpIH4+IFxuICAgIGlmIG5vdCBvYmouanF1ZXJ5PyB0aGVuIG9iai5vZmYgbmFtZSwgY2FsbGJhY2ssIEBcbiAgICBlbHNlIG9iai5vZmYgbmFtZSwgY2FsbGJhY2tcblxuICAgIGlmIHJlbW92ZSBvciBfLmlzRW1wdHkob2JqLl9ldmVudHMpIHRoZW4gZGVsZXRlIEBfbGlzdGVuaW5nVG9baWRdXG4gIEBcblxubWV0YU1lcmdlciA9IGV4cG9ydHMubWV0YU1lcmdlciA9IHt9XG5cbm1ldGFNZXJnZXIuaXRlcmF0aXZlID0gKG9wdGlvbnMsIGF0dHJOYW1lKSAtLT5cbiAgKGNsYXNzZXMpIC0+XG4gICAgeyByaWdodCA9IGZhbHNlLCBjaGVjaywgam9pbiwgcG9zdEpvaW4gfSA9IG9wdGlvbnNcbiAgICBpZiByaWdodCB0aGVuIGl0ZXJGID0gXy5yZWR1Y2VSaWdodCBlbHNlIGl0ZXJGID0gXy5yZWR1Y2VcbiAgICAgIFxuICAgIGpvaW5lZEF0dHJpYnV0ZSA9IGl0ZXJGIGNsYXNzZXMsICgoam9pbmVkLCBjbHMpIC0+XG4gICAgICBhdHRyID0gY2xzW2F0dHJOYW1lXVxuICAgICAgaWYgbm90IGNoZWNrIG9yIGNoZWNrIGF0dHJcbiAgICAgICAgaWYgam9pbmVkIHRoZW4gam9pbihqb2luZWQsIGF0dHIpIGVsc2UgYXR0clxuICAgICAgZWxzZSBqb2luZWQpLCB2b2lkXG5cbiAgICBpZiBqb2luZWRBdHRyaWJ1dGVcbiAgICAgIHJldCA9IHt9XG4gICAgICByZXRbYXR0ck5hbWVdID0gam9pbmVkQXR0cmlidXRlICAgXG4gICAgICAjIHBvc3Rwcm9jZXNzaW5nP1xuICAgICAgaWYgcG9zdEpvaW4gdGhlbiBwb3N0Sm9pbiByZXQsIGF0dHJOYW1lLCBvcHRpb25zXG4gICAgICBlbHNlIHJldFxuICAgICAgXG4gICAgZWxzZSB2b2lkXG5cblxubWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZUxlZnQgPSBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlID0gbWV0YU1lcmdlci5pdGVyYXRpdmVcblxubWV0YU1lcmdlci5jaGFpbkYgPSBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlIGNoZWNrOiAoKGYpIC0+IGY/QEAgaXMgRnVuY3Rpb24pLCBqb2luOiAoKGYxLCBmMikgLT4gLT4gZjIoLi4uKTsgZjEoLi4uKSkgIFxubWV0YU1lcmdlci5jaGFpbkZSaWdodCA9IG1ldGFNZXJnZXIubWVyZ2VBdHRyaWJ1dGUgcmlnaHQ6IHRydWUsIGNoZWNrOiAoKGYpIC0+IGY/QEAgaXMgRnVuY3Rpb24pLCBqb2luOiAoKGYxLCBmMikgLT4gLT4gZjIoLi4uKTsgZjEoLi4uKSkgIFxuXG5tZXRhTWVyZ2VyLnBpcGVGID0gbWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZSByaWdodDogdHJ1ZSwgY2hlY2s6ICgoZikgLT4gZj9AQCBpcyBGdW5jdGlvbiksIGpvaW46ICgoZjEsIGYyKSAtPiBmMiA8PCBmMSkgIFxubWV0YU1lcmdlci5waXBlRlJpZ2h0ID0gbWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZSByaWdodDogdHJ1ZSwgY2hlY2s6ICgoZikgLT4gZj9AQCBpcyBGdW5jdGlvbiksIGpvaW46ICgoZjEsIGYyKSAtPiBmMSA8PCBmMikgIFxuXG5cbm1ldGFNZXJnZXIubWVyZ2VEaWN0ID0gbWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZSByaWdodDogdHJ1ZSwgY2hlY2s6ICgoZCkgLT4gZD9AQCBpcyBPYmplY3QpLCBqb2luOiAoZDEsIGQyKSAtPiBfLmV4dGVuZCB7fSwgZDEsIGQyXG5tZXRhTWVyZ2VyLm1lcmdlRGljdERlZXAgPSBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlIHJpZ2h0OiB0cnVlLCBjaGVjazogKChkKSAtPiBkP0BAIGlzIE9iamVjdCksIGpvaW46IChkMSwgZDIpIC0+IGguZXh0ZW5kIGQxLCBkMlxuXG5tZXJnZXIgPSBleHBvcnRzLm1lcmdlciA9IHt9XG5cbm1lcmdlci5pbml0aWFsaXplID0gbWV0YU1lcmdlci5jaGFpbkYgJ2luaXRpYWxpemUnXG5tZXJnZXIuZGVmYXVsdHMgPSBtZXRhTWVyZ2VyLm1lcmdlRGljdCAnZGVmYXVsdHMnXG5tZXJnZXIuZGVlcERlZmF1bHRzID0gbWV0YU1lcmdlci5tZXJnZURpY3REZWVwICdkZWZhdWx0cydcbm1lcmdlci5zdHJpbmdpZnlQYXJzZSA9IG1ldGFNZXJnZXIucGlwZUZSaWdodCAnc3RyaW5naWZ5UGFyc2UnXG5cbkJhY2tib25lLk1vZGVsLm1lcmdlcnMgPSBbIG1lcmdlci5pbml0aWFsaXplLCBtZXJnZXIuZGVmYXVsdHMsIG1lcmdlci5zdHJpbmdpZnlQYXJzZSBdXG5CYWNrYm9uZS5WaWV3Lm1lcmdlcnMgPSBbIG1lcmdlci5pbml0aWFsaXplIF1cblxuXG4iXX0=
