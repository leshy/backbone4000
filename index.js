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
  Backbone.Model.mergers = [merger.initialize, merger.defaults, metaMerger.pipeFRight('stringifyParse')];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3llbnRvd24vdHJhZGVyL25vZGVfbW9kdWxlcy9iYWNrYm9uZTQwMDAvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFFYyxDQUFaLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBO0VBQ1MsQ0FBVCxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQTtFQUdGLFFBQVMsQ0FBQSxDQUFBLENBQUUsUUFBUSxVQUFBO0VBQ25CLENBQUMsQ0FBQyxPQUFPLFNBQVMsUUFBVDtFQUVULFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQTs7SUFBSTtJQUMxRixlQUFnQixDQUFBLENBQUEsQ0FBRTtJQUVsQixPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxJQUFJLFNBQVMsUUFBQSxDQUFBLEdBQUE7O01BQ3ZCLElBQUcsQ0FBSSxHQUFQO1FBQ0UsT0FBTyxDQUFDLElBQStDLDZDQUFFLE9BQUY7UUFDdkQsR0FBSSxDQUFBLENBQUEsS0FBTSxNQUFNLHVDQUFBO1FBQ2hCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFKO1FBQ1osTUFBTSxHQUFOOztNQUNGLElBQUcsR0FBRyxDQUFBLFNBQU47UUFBYyxNQUFBLENBQU8sR0FBRyxDQUFBLFNBQVY7T0FBYTtlQUFLOztLQU5sQjtJQVFoQixZQUFhLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQSxRQUFBOztNQUNiLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFDLFlBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sU0FBUyxRQUFULENBQVIsQ0FBWDtNQUN4QixJQUFHLE9BQUg7UUFBZ0IsTUFBQSxDQUFPLGVBQWUsQ0FBQyxRQUFELENBQVcsQ0FBQSxD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QkFBRCxDQUhFO0VBTXpCLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUN0QixNQUFNLENBQUMsVUFEZSIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcbnJlcXVpcmUhIHtcbiAgdW5kZXJzY29yZTogX1xuICBoZWxwZXJzOiBoXG59XG5cbkJhY2tib25lID0gcmVxdWlyZSAnLi9qc3BhcnQnXG5fLmV4dGVuZCBleHBvcnRzLCBCYWNrYm9uZVxuXG5CYWNrYm9uZS5Nb2RlbC5leHRlbmQ0MDAwID0gQmFja2JvbmUuVmlldy5leHRlbmQ0MDAwID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQ0MDAwID0gKC4uLmNsYXNzZXMpIC0+XG4gIGNsYXNzUHJvcGVydGllcyA9IHt9XG4gIFxuICBjbGFzc2VzID0gXy5tYXAgY2xhc3NlcywgKGNscykgLT5cbiAgICBpZiBub3QgY2xzXG4gICAgICBjb25zb2xlLmxvZyBcIm9uZSBvZiBteSBjbGFzc2VzIGlzIGVtcHR5LCB3aWxsIHRocm93OlxcblwiLCBjbGFzc2VzXG4gICAgICBlcnIgPSBuZXcgRXJyb3IgJ2V4dGVuZDQwMDAgY2FsbGVkIHdpdGggYW4gZW1wdHkgY2xhc3MnXG4gICAgICBjb25zb2xlLmxvZyBlcnIuc3RhY2tcbiAgICAgIHRocm93IGVyclxuICAgIGlmIGNsczo6IHRoZW4gcmV0dXJuIGNsczo6IGVsc2UgY2xzXG5cbiAgY2xhc3NJbmhlcml0ID0gKGF0dHJOYW1lKSB+PlxuICAgIG5ld0F0dHIgPSBoLmZpbHRlckZhbHNlIChfLmZsYXR0ZW4gXy5wbHVjayBjbGFzc2VzLCBhdHRyTmFtZSlcbiAgICBpZiBuZXdBdHRyIHRoZW4gcmV0dXJuIGNsYXNzUHJvcGVydGllc1thdHRyTmFtZV0gPSBoLnB1c2ggQFthdHRyTmFtZV0sIG5ld0F0dHJcbiAgICByZXR1cm4gQFthdHRyTmFtZV1cblxuICAjIHNtYXJ0IGNsYXNzIGpvaW4gdmlhIG1lcmdlcnNcbiAgbWVyZ2VycyA9IGNsYXNzSW5oZXJpdCAnbWVyZ2VycydcbiAgXy5tYXAgbWVyZ2VycywgKG1lcmdlcikgfj4gaC5wdXNobSBjbGFzc2VzLCBtZXJnZXIuY2FsbChALCBjbGFzc2VzLmNvbmNhdChAOjopKVxuXG4gICMgbWVyZ2UgYWxsIGNsYXNzZXNcbiAgbmV3Q2xhc3MgPSBfLnJlZHVjZSBjbGFzc2VzLCAoKG5ld0NsYXNzLGluY2x1ZGVDbGFzcykgLT5cbiAgICBuZXdDbGFzcy5leHRlbmQgaW5jbHVkZUNsYXNzKSwgQFxuXG5cbiAgIyBhcHBseSBtZXRhY2xhc3MgdHJhbnNmb3JtYXRpb25zXG4gIHRyYW5zZm9ybWVycyA9IGNsYXNzSW5oZXJpdCAndHJhbnNmb3JtZXJzJ1xuICBuZXdDbGFzcyA9IF8ucmVkdWNlKCAodHJhbnNmb3JtZXJzIG9yIFtdKSwgKChuZXdDbGFzcyx0cmFuc2Zvcm1lcikgfj4gdHJhbnNmb3JtZXIobmV3Q2xhc3MsQCkpLCBuZXdDbGFzcylcblxuICAjIGluaGVyaXQgY2xhc3MgcHJvcGVydGllcyAobWVyZ2VycyBhbmQgdHJhbnNmb3JtZXJzKVxuICBuZXdDbGFzcyA9IG5ld0NsYXNzLmV4dGVuZCB7fSwgY2xhc3NQcm9wZXJ0aWVzXG5cbiAgICBcblN1YkNvbnRleHQgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQ0MDAwKCByZW1vdmU6IC0+IEBzdG9wTGlzdGVuaW5nKCkgKVxuQmFja2JvbmUuTW9kZWw6OnN1YkNvbnRleHQgPSAtPiByZXR1cm4gbmV3IFN1YkNvbnRleHQoKVxuXG5saXN0ZW5NZXRob2RzID0geyBsaXN0ZW5UbzogJ29uJywgbGlzdGVuVG9PbmNlOiAnb25jZSd9O1xuXG5fLmVhY2ggbGlzdGVuTWV0aG9kcywgKGltcGxlbWVudGF0aW9uLCBtZXRob2QpIC0+XG4gIEJhY2tib25lLk1vZGVsOjpbbWV0aG9kXSA9IChvYmosIG5hbWUsIGNhbGxiYWNrKSAtPlxuICAgIGxpc3RlbmluZ1RvID0gQC5fbGlzdGVuaW5nVG8gb3IgQC5fbGlzdGVuaW5nVG8gPSB7fVxuICAgIGlkID0gb2JqLl9saXN0ZW5JZCBvciBvYmouX2xpc3RlbklkID0gXy51bmlxdWVJZCgnbCcpXG5cbiAgICBsaXN0ZW5pbmdUb1tpZF0gPSBvYmpcbiAgICBpZiBub3QgY2FsbGJhY2sgYW5kIHR5cGVvZiBuYW1lIGlzICdvYmplY3QnIHRoZW4gY2FsbGJhY2sgPSBAXG4gICAgaWYgbm90IG9iai5qcXVlcnk/IHRoZW4gb2JqW2ltcGxlbWVudGF0aW9uXSBuYW1lLCBjYWxsYmFjaywgQFxuICAgIGVsc2VcbiAgICAgIGlmIGltcGxlbWVudGF0aW9uIGlzICdvbmNlJ1xuICAgICAgICBvYmoub25lIG5hbWUsIGNhbGxiYWNrXG4gICAgICBlbHNlXG4gICAgICAgIG9ialtpbXBsZW1lbnRhdGlvbl0gbmFtZSwgY2FsbGJhY2sgICAgICBcbiAgICBAXG5cbkJhY2tib25lLk1vZGVsOjp0b0pTT04gPSAtPlxuICBhdHRyID0gXy5jbG9uZSBAYXR0cmlidXRlc1xuICBpZiBAc3RyaW5naWZ5T21pdCB0aGVuIGF0dHIgPSBfLm9taXQgYXR0ciwgQHN0cmluZ2lmeU9taXRcbiAgaWYgQHN0cmluZ2lmeVBpY2sgdGhlbiBhdHRyID0gXy5waWNrIGF0dHIsIEBzdHJpbmdpZnlQaWNrXG4gIEBzdHJpbmdpZnlQYXJzZSBhdHRyXG4gIFxuQmFja2JvbmUuTW9kZWw6OnN0cmluZ2lmeVBhcnNlID0gKGF0dHIpIC0+XG4gIF8ubWFwT2JqZWN0IGF0dHIsICh2YWx1ZSwga2V5KSAtPlxuICAgIGlmIHR5cGVvZiEgdmFsdWUgaXMgJ09iamVjdCcgYW5kIHZhbHVlQEAgaXNudCBPYmplY3QgdGhlbiB2YWx1ZS50b0pTT04/IVxuICAgIGVsc2UgdmFsdWUgIFxuICAgICAgICAgICAgXG5CYWNrYm9uZS5Nb2RlbDo6c3RvcExpc3RlbmluZyA9IChvYmosIG5hbWUsIGNhbGxiYWNrKSAtPlxuICBsaXN0ZW5pbmdUbyA9IEBfbGlzdGVuaW5nVG9cbiAgaWYgbm90IGxpc3RlbmluZ1RvIHRoZW4gcmV0dXJuIEBcbiAgcmVtb3ZlID0gbm90IG5hbWUgYW5kIG5vdCBjYWxsYmFja1xuXG4gIGlmIG5vdCBjYWxsYmFjayBhbmQgdHlwZW9mIG5hbWUgaXMgJ29iamVjdCcgdGhlbiBjYWxsYmFjayA9IEBcbiAgaWYgb2JqIHRoZW4gKGxpc3RlbmluZ1RvID0ge30pW29iai5fbGlzdGVuSWRdID0gb2JqXG5cbiAgXy5lYWNoIGxpc3RlbmluZ1RvLCAob2JqLCBpZCkgfj4gXG4gICAgaWYgbm90IG9iai5qcXVlcnk/IHRoZW4gb2JqLm9mZiBuYW1lLCBjYWxsYmFjaywgQFxuICAgIGVsc2Ugb2JqLm9mZiBuYW1lLCBjYWxsYmFja1xuXG4gICAgaWYgcmVtb3ZlIG9yIF8uaXNFbXB0eShvYmouX2V2ZW50cykgdGhlbiBkZWxldGUgQF9saXN0ZW5pbmdUb1tpZF1cbiAgQFxuXG5cbiNcbiMgbWV0YU1lcmdlcnMgYXJlIHRoZSBjb3JlIG9mIHRoaXMgb2JqZWN0IG1vZGVscyBtdWx0aXBsZSBpbmhlcml0YW5jZSBzeXN0ZW1cbiMgXG4jIHRoZXkgZGVmaW5lIHRoZSB3YXkgbXVsdGlwbGUgY2xhc3NlcyBjb21iaW5lIHRoZW1zZWx2ZXMgdGhlIGZpbmFsIGNsYXNzXG4jXG4jIG1ldGhvZHMgYW5kIGF0dHJpYnV0ZXMgYXJlIG5vdCBuZWNjZXNzYXJpbHkganVzdCByZXBsYWNlZCBieSBhIHRvcCBsZXZlbCBkZWZpbml0aW9uIGJ1dCBjaGFpbmVkLCBwaXBlZCwgcmVwbGFjZWQsIGFkZGVkLCBvciBwYXJzZWQgaW4gYXJiaXRyYXJ5IHdheXMgaW50byB0aGUgZmluYWwgY2xhc3MgbWV0aG9kcyBhbmQgYXR0cmlidXRlc1xuIyBzdXBwb3J0cyBjb25maWd1cmluZyB0aGUgbWVyZ2VycyBmcm9tIHRoZSBjb25zdHJ1Y3RvciBkZWZpbml0aW9ucyB0aGVtc2VsdmVzIGFuZCBtZXJnZSBwb3N0cHJvY2Vzc2luZ1xuI1xuIyBmb3IgZXhhbXBsZSwgZm9yIHRoZSBkZWZhdWx0IG1vZGVsLFxuIyBcImRlZmF1bHRzXCIgT2JqZWN0IGF0dHJpYnV0ZSBpcyBtZXJnZWQgZnJvbSBzdXBlcmNsYXNzZXNcbiMgXCJpbml0aWFsaXplXCIgZnVuY3Rpb25zIGFyZSByYW4gb25lIGFmdGVyIHRoZSBvdGhlclxuIyBcInN0cmluZ2lmeVBhcnNlXCIgZnVuY3Rpb25zIGFyZSBwaXBlZCBpbnRvIGVhY2ggb3RoZXJcbiNcbiMgY2hlY2sgaHR0cHM6Ly9naXRodWIuY29tL2xlc2h5L2Fic3RyYWN0bWFuL2Jsb2IvbWFzdGVyL2dyYXBoLmxzIGZvciBhbiBhZHZhbmNlZCB1c2UgY2FzZVxuIyBcblxubWV0YU1lcmdlciA9IGV4cG9ydHMubWV0YU1lcmdlciA9IHt9XG5cbm1ldGFNZXJnZXIuaXRlcmF0aXZlID0gKG9wdGlvbnMsIGF0dHJOYW1lKSAtLT5cbiAgKGNsYXNzZXMpIC0+XG4gICAgeyByaWdodCA9IGZhbHNlLCBjaGVjaywgam9pbiwgcG9zdEpvaW4gfSA9IG9wdGlvbnNcbiAgICBpZiByaWdodCB0aGVuIGl0ZXJGID0gXy5yZWR1Y2VSaWdodCBlbHNlIGl0ZXJGID0gXy5yZWR1Y2VcbiAgICAgIFxuICAgIGpvaW5lZEF0dHJpYnV0ZSA9IGl0ZXJGIGNsYXNzZXMsICgoam9pbmVkLCBjbHMpIC0+XG4gICAgICBhdHRyID0gY2xzW2F0dHJOYW1lXVxuICAgICAgaWYgbm90IGNoZWNrIG9yIGNoZWNrIGF0dHJcbiAgICAgICAgaWYgam9pbmVkIHRoZW4gam9pbihqb2luZWQsIGF0dHIpIGVsc2UgYXR0clxuICAgICAgZWxzZSBqb2luZWQpLCB2b2lkXG5cbiAgICBpZiBqb2luZWRBdHRyaWJ1dGVcbiAgICAgIHJldCA9IHt9XG4gICAgICByZXRbYXR0ck5hbWVdID0gam9pbmVkQXR0cmlidXRlXG4gICAgICBcbiAgICAgICMgcG9zdHByb2Nlc3Npbmc/XG4gICAgICBpZiBwb3N0Sm9pbiB0aGVuIHBvc3RKb2luIHJldCwgYXR0ck5hbWUsIG9wdGlvbnNcbiAgICAgIGVsc2UgcmV0XG4gICAgICBcbiAgICBlbHNlIHZvaWRcblxubWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZUxlZnQgPSBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlID0gbWV0YU1lcmdlci5pdGVyYXRpdmVcblxubWV0YU1lcmdlciA8PDwgZG9cbiAgY2hhaW5GOlxuICAgIG1ldGFNZXJnZXIubWVyZ2VBdHRyaWJ1dGUgZG9cbiAgICAgIGNoZWNrOiAoKGYpIC0+IGY/QEAgaXMgRnVuY3Rpb24pXG4gICAgICBqb2luOiAoKGYxLCBmMikgLT4gLT4gZjIoLi4uKTsgZjEoLi4uKSlcbiAgXG4gIGNoYWluRlJpZ2h0OlxuICAgIG1ldGFNZXJnZXIubWVyZ2VBdHRyaWJ1dGUgZG9cbiAgICAgIHJpZ2h0OiB0cnVlXG4gICAgICBjaGVjazogKChmKSAtPiBmP0BAIGlzIEZ1bmN0aW9uKVxuICAgICAgam9pbjogKChmMSwgZjIpIC0+IC0+IGYyKC4uLik7IGYxKC4uLikpICBcblxuICBwaXBlRjpcbiAgICBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlIGRvXG4gICAgICBjaGVjazogKChmKSAtPiBmP0BAIGlzIEZ1bmN0aW9uKVxuICAgICAgam9pbjogKChmMSwgZjIpIC0+IGYyIDw8IGYxKVxuICBcbiAgcGlwZUZSaWdodDpcbiAgICBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlIGRvXG4gICAgICByaWdodDogdHJ1ZVxuICAgICAgY2hlY2s6ICgoZikgLT4gZj9AQCBpcyBGdW5jdGlvbilcbiAgICAgIGpvaW46ICgoZjEsIGYyKSAtPiBmMSA8PCBmMikgIFxuXG4gIG1lcmdlRGljdDpcbiAgICBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlIGRvXG4gICAgICByaWdodDogdHJ1ZVxuICAgICAgY2hlY2s6ICgoZCkgLT4gZD9AQCBpcyBPYmplY3QpXG4gICAgICBqb2luOiAoZDEsIGQyKSAtPiB7fSA8PDwgZDEgPDw8IGQyXG4gIFxuICBtZXJnZURpY3REZWVwOlxuICAgIG1ldGFNZXJnZXIubWVyZ2VBdHRyaWJ1dGUgZG9cbiAgICAgIHJpZ2h0OiB0cnVlLCBjaGVjazogKChkKSAtPiBkP0BAIGlzIE9iamVjdClcbiAgICAgIGpvaW46IChkMSwgZDIpIC0+IGguZXh0ZW5kIGQxLCBkMlxuXG5tZXJnZXIgPSBleHBvcnRzLm1lcmdlciA9IGRvXG4gIGluaXRpYWxpemU6IG1ldGFNZXJnZXIuY2hhaW5GICdpbml0aWFsaXplJ1xuICBkZWZhdWx0czogbWV0YU1lcmdlci5tZXJnZURpY3QgJ2RlZmF1bHRzJ1xuICBkZWVwRGVmYXVsdHM6IG1ldGFNZXJnZXIubWVyZ2VEaWN0RGVlcCAnZGVmYXVsdHMnXG5cbkJhY2tib25lLk1vZGVsLm1lcmdlcnMgPSBbXG4gIG1lcmdlci5pbml0aWFsaXplXG4gIG1lcmdlci5kZWZhdWx0c1xuICBtZXRhTWVyZ2VyLnBpcGVGUmlnaHQoJ3N0cmluZ2lmeVBhcnNlJylcbl1cblxuQmFja2JvbmUuVmlldy5tZXJnZXJzID0gW1xuICBtZXJnZXIuaW5pdGlhbGl6ZVxuXVxuXG5cbiJdfQ==
