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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3llbnRvd24vdHJhZGVyL25vZGVfbW9kdWxlcy9iYWNrYm9uZTQwMDAvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFFYyxDQUFaLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBO0VBQ1MsQ0FBVCxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQTtFQUdGLFFBQVMsQ0FBQSxDQUFBLENBQUUsUUFBUSxVQUFBO0VBQ25CLENBQUMsQ0FBQyxPQUFPLFNBQVMsUUFBVDtFQUVULFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQTs7SUFBSTtJQUMxRixlQUFnQixDQUFBLENBQUEsQ0FBRTtJQUVsQixPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxJQUFJLFNBQVMsUUFBQSxDQUFBLEdBQUE7O01BQ3ZCLElBQUcsQ0FBSSxHQUFQO1FBQ0UsT0FBTyxDQUFDLElBQStDLDZDQUFFLE9BQUY7UUFDdkQsR0FBSSxDQUFBLENBQUEsS0FBTSxNQUFNLHVDQUFBO1FBQ2hCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFKO1FBQ1osTUFBTSxHQUFOOztNQUNGLElBQUcsR0FBRyxDQUFBLFNBQU47UUFBYyxNQUFBLENBQU8sR0FBRyxDQUFBLFNBQVY7T0FBYTtlQUFLOztLQU5sQjtJQVFoQixZQUFhLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQSxRQUFBOztNQUNiLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFDLFlBQWEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sU0FBUyxRQUFULENBQVIsQ0FBWDtNQUN4QixJQUFHLE9BQUg7UUFBZ0IsTUFBQSxDQUFPLGVBQWUsQ0FBQyxRQUFELENBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFDLElBQXJDLENBQTBDLEtBQUMsQ0FBQyxRQUFELENBQTNDLEVBQXVELE9BQWIsQ0FBMUM7O01BQ2hCLE1BQUEsQ0FBTyxLQUFDLENBQUMsUUFBRCxDQUFSOztJQUdGLE9BQVEsQ0FBQSxDQUFBLENBQUUsYUFBYSxTQUFBO0lBQ3ZCLENBQUMsQ0FBQyxJQUFJLFNBQVMsUUFBQSxDQUFBLE1BQUE7YUFBWSxDQUFDLENBQUMsTUFBTSxTQUFTLE1BQU0sQ0FBQyxLQUFLLE9BQUcsT0FBTyxDQUFDLE9BQU8sS0FBQyxDQUFBLFNBQUYsQ0FBbEIsQ0FBcEI7S0FBN0I7SUFHTixRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxPQUFPLFNBQVUsUUFBQSxDQUFBLFFBQUEsRUFBQSxZQUFBO2FBQzVCLFFBQVEsQ0FBQyxPQUFPLFlBQUE7T0FBZSxJQURiO0lBSXBCLFlBQWEsQ0FBQSxDQUFBLENBQUUsYUFBYSxjQUFBO0lBQzVCLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFDLE9BQVMsWUFBYSxDQUFBLEVBQUEsQ0FBRyxJQUFNLFFBQUEsQ0FBQSxRQUFBLEVBQUEsV0FBQTthQUEwQixZQUFZLFVBQVMsS0FBVjtPQUFlLFFBQTdFO1dBR25CLFFBQVMsQ0FBQSxDQUFBLENBQUUsUUFBUSxDQUFDLE9BQU8sSUFBSSxlQUFKOztFQUc3QixVQUFXLENBQUEsQ0FBQSxDQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBWTtJQUFBLFFBQVEsUUFBQSxDQUFBO2FBQUcsSUFBQyxDQUFBLGNBQWE7O0VBQXpCLENBQUY7RUFDdEMsUUFBUSxDQUFDLEtBQUssQ0FBQSxTQUFFLENBQUEsVUFBVyxDQUFBLENBQUEsQ0FBRSxRQUFBLENBQUE7SUFBRyxNQUFBLENBQUEsSUFBVyxVQUFYLENBQXFCLENBQXJCOztFQUVoQyxhQUFjLENBQUEsQ0FBQSxDQUFFO0lBQUUsVUFBVTtJQUFNLGNBQWM7RUFBaEM7RUFFaEIsQ0FBQyxDQUFDLEtBQUssZUFBZSxRQUFBLENBQUEsY0FBQSxFQUFBLE1BQUE7V0FDcEIsUUFBUSxDQUFDLEtBQUssQ0FBQSxTQUFFLENBQUMsTUFBRCxDQUFTLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUE7O01BQ3pCLFdBQVksQ0FBQSxDQUFBLENBQUUsSUFBQyxDQUFDLFlBQWEsQ0FBQSxFQUFBLENBQUEsQ0FBRyxJQUFDLENBQUMsWUFBYSxDQUFBLENBQUEsQ0FBRSxFQUFwQjtNQUM3QixFQUFHLENBQUEsQ0FBQSxDQUFFLEdBQUcsQ0FBQyxTQUFVLENBQUEsRUFBQSxDQUFBLENBQUcsR0FBRyxDQUFDLFNBQVUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFDLFFBQXJCLENBQThCLEdBQUQsQ0FBN0I7TUFFbkIsV0FBVyxDQUFDLEVBQUQsQ0FBSyxDQUFBLENBQUEsQ0FBRTtNQUNsQixJQUFHLENBQUksUUFBUyxDQUFBLEVBQUEsQ0FBSSxPQUFPLElBQUssQ0FBQSxHQUFBLENBQUcsUUFBbkM7UUFBaUQsUUFBUyxDQUFBLENBQUEsQ0FBRTs7TUFDNUQsSUFBTyxHQUFHLENBQUMsTUFBUixRQUFIO1FBQXdCLEdBQUcsQ0FBQyxjQUFELEVBQWlCLE1BQU0sVUFBVSxJQUFoQjtPQUM1QztRQUNFLElBQUcsY0FBZSxDQUFBLEdBQUEsQ0FBRyxNQUFyQjtVQUNFLEdBQUcsQ0FBQyxJQUFJLE1BQU0sUUFBTjtTQUNWO1VBQ0UsR0FBRyxDQUFDLGNBQUQsRUFBaUIsTUFBTSxRQUFOOzs7YUFDeEI7O0dBYkc7RUFlUCxRQUFRLENBQUMsS0FBSyxDQUFBLFNBQUUsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFFLFFBQUEsQ0FBQTs7SUFDdkIsSUFBSyxDQUFBLENBQUEsQ0FBRSxJQUFDLENBQUE7SUFDUixJQUFHLElBQUMsQ0FBQSxhQUFKO01BQXVCLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFDLENBQUEsYUFBUDs7SUFDckMsSUFBRyxJQUFDLENBQUEsYUFBSjtNQUF1QixJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBQyxLQUFLLE1BQU0sSUFBQyxDQUFBLGFBQVA7O1dBRXJDLENBQUMsQ0FBQyxVQUFVLE1BQU0sUUFBQSxDQUFBLEtBQUEsRUFBQSxHQUFBO01BQ2hCLElBQUcsS0FBQSxDQUFBLFVBQUEsQ0FBaUIsTUFBTyxDQUFBLEVBQUEsQ0FBSSxLQUFLLENBQUEsV0FBRyxDQUFBLEdBQUEsQ0FBSyxNQUE1QztpREFBd0QsRUFBQSxLQUFLLENBQUMsT0FBTztPQUNyRTtlQUFLOztLQUZLOztFQUlkLFFBQVEsQ0FBQyxLQUFLLENBQUEsU0FBRSxDQUFBLGFBQWMsQ0FBQSxDQUFBLENBQUUsUUFBQSxDQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQTs7SUFDOUIsV0FBWSxDQUFBLENBQUEsQ0FBRSxJQUFDLENBQUE7SUFDZixJQUFHLENBQUksV0FBUDtNQUF3QixNQUFBLENBQU8sSUFBUDs7SUFDeEIsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFJLElBQUssQ0FBQSxFQUFBLENBQUksQ0FBSTtJQUUxQixJQUFHLENBQUksUUFBUyxDQUFBLEVBQUEsQ0FBSSxPQUFPLElBQUssQ0FBQSxHQUFBLENBQUcsUUFBbkM7TUFBaUQsUUFBUyxDQUFBLENBQUEsQ0FBRTs7SUFDNUQsSUFBRyxHQUFIO09BQWEsV0FBWSxDQUFBLENBQUEsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQUwsQ0FBZ0IsQ0FBQSxDQUFBLENBQUU7O0lBRWhELENBQUMsQ0FBQyxLQUFLLGFBQWEsUUFBQSxDQUFBLEdBQUEsRUFBQSxFQUFBOztNQUNsQixJQUFPLEdBQUcsQ0FBQyxNQUFSLFFBQUg7UUFBd0IsR0FBRyxDQUFDLElBQUksTUFBTSxVQUFVLEtBQWhCO09BQ2hDO1FBQUssR0FBRyxDQUFDLElBQUksTUFBTSxRQUFOOztNQUViLElBQUcsTUFBTyxDQUFBLEVBQUEsQ0FBRyxDQUFDLENBQUMsT0FBTCxDQUFhLEdBQUcsQ0FBQyxPQUFMLENBQXRCO2VBQXlDLEtBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQU8sS0FBQyxDQUFBLFlBQVIsQ0FBb0IsQ0FBQyxFQUFELENBQXBCLFNBQUEsSUFBb0IsQ0FBQyxFQUFELENBQXBCLEVBQUE7O0tBSnBDO1dBS1A7O0VBRUYsVUFBVyxDQUFBLENBQUEsQ0FBRSxPQUFPLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRTtFQUVsQyxVQUFVLENBQUMsU0FBVSxDQUFBLENBQUEsUUFBRSxRQUFBLENBQUEsT0FBQSxFQUFBLFFBQUE7V0FDckIsUUFBQSxDQUFBLE9BQUE7O01BQ0ksS0FBdUMsQ0FBQSxDQUFBLENBQXpDLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBMkMsT0FBM0MsQ0FBRSxLQUFGLENBQUEsUUFBQSxDQUFBLEVBQUEsSUFBQSxDQUFVLEVBQUEsS0FBVixFQUFpQixLQUF3QixDQUFBLENBQUEsQ0FBRSxPQUEzQyxDQUFpQixLQUFqQixFQUF3QixJQUFpQixDQUFBLENBQUEsQ0FBRSxPQUEzQyxDQUF3QixJQUF4QixFQUE4QixRQUFXLENBQUEsQ0FBQSxDQUFFLE9BQTNDLENBQThCO01BQzlCLElBQUcsS0FBSDtRQUFjLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxDQUFDO09BQVk7UUFBSyxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsQ0FBQzs7TUFFbkQsZUFBZ0IsQ0FBQSxDQUFBLENBQUUsTUFBTSxTQUFVLFFBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQTs7UUFDaEMsSUFBSyxDQUFBLENBQUEsQ0FBRSxHQUFHLENBQUMsUUFBRDtRQUNWLElBQUcsQ0FBSSxLQUFNLENBQUEsRUFBQSxDQUFHLEtBQUgsQ0FBUyxJQUFBLENBQXRCO1VBQ0UsSUFBRyxNQUFIO21CQUFlLEtBQUssUUFBUSxJQUFUO1dBQWU7bUJBQUs7O1NBQ3pDO2lCQUFLOztTQUFTLE1BSlE7TUFNeEIsSUFBRyxlQUFIO1FBQ0UsR0FBSSxDQUFBLENBQUEsQ0FBRTtRQUNOLEdBQUcsQ0FBQyxRQUFELENBQVcsQ0FBQSxDQUFBLENBQUU7UUFFaEIsSUFBRyxRQUFIO2lCQUFpQixTQUFTLEtBQUssVUFBVSxPQUFmO1NBQzFCO2lCQUFLOztPQUVQLE1BQUE7OztFQUdKLFVBQVUsQ0FBQyxrQkFBbUIsQ0FBQSxDQUFBLENBQUUsVUFBVSxDQUFDLGNBQWUsQ0FBQSxDQUFBLENBQUUsVUFBVSxDQUFDO0VBRXZFLFVBQVUsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLFVBQVUsQ0FBQyxlQUFlO0lBQUEsT0FBUSxRQUFBLENBQUEsQ0FBQTthQUFZLENBQUwsQ0FBSyxRQUFBLENBQUwsRUFBQSxDQUFFLENBQUEsV0FBRyxDQUFBLEVBQUEsTUFBQSxDQUFBLENBQUEsR0FBQSxDQUFHOztJQUFXLE1BQU8sUUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBO2FBQVksUUFBQSxDQUFBO1FBQUcsd0JBQUU7ZUFBTyx3QkFBRTs7O0VBQW5FLENBQUE7RUFDOUMsVUFBVSxDQUFDLFdBQVksQ0FBQSxDQUFBLENBQUUsVUFBVSxDQUFDLGVBQWU7SUFBQSxPQUFPO0lBQU0sT0FBUSxRQUFBLENBQUEsQ0FBQTthQUFZLENBQUwsQ0FBSyxRQUFBLENBQUwsRUFBQSxDQUFFLENBQUEsV0FBRyxDQUFBLEVBQUEsTUFBQSxDQUFBLENBQUEsR0FBQSxDQUFHOztJQUFXLE1BQU8sUUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBO2FBQVksUUFBQSxDQUFBO1FBQUcsd0JBQUU7ZUFBTyx3QkFBRTs7O0VBQWhGLENBQUE7RUFFbkQsVUFBVSxDQUFDLFNBQVUsQ0FBQSxDQUFBLENBQUUsVUFBVSxDQUFDLGVBQWU7SUFBQSxPQUFPO0lBQU0sT0FBUSxRQUFBLENBQUEsQ0FBQTthQUFZLENBQUwsQ0FBSyxRQUFBLENBQUwsRUFBQSxDQUFFLENBQUEsV0FBRyxDQUFBLEVBQUEsTUFBQSxDQUFBLENBQUEsR0FBQSxDQUFHOztJQUFTLE1BQU0sUUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBO2FBQVksQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQVI7O0VBQXhFLENBQUE7RUFDakQsVUFBVSxDQUFDLGFBQWMsQ0FBQSxDQUFBLENBQUUsVUFBVSxDQUFDLGVBQWU7SUFBQSxPQUFPO0lBQU0sT0FBUSxRQUFBLENBQUEsQ0FBQTthQUFZLENBQUwsQ0FBSyxRQUFBLENBQUwsRUFBQSxDQUFFLENBQUEsV0FBRyxDQUFBLEVBQUEsTUFBQSxDQUFBLENBQUEsR0FBQSxDQUFHOztJQUFTLE1BQU0sUUFBQSxDQUFBLEVBQUEsRUFBQSxFQUFBO2FBQVksQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFKOztFQUF4RSxDQUFBO0VBRXJELE1BQU8sQ0FBQSxDQUFBLENBQUUsT0FBTyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUU7RUFFMUIsTUFBTSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsVUFBVSxDQUFDLE9BQU8sWUFBQTtFQUN0QyxNQUFNLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxVQUFVLENBQUMsVUFBVSxVQUFBO0VBQ3ZDLE1BQU0sQ0FBQyxZQUFhLENBQUEsQ0FBQSxDQUFFLFVBQVUsQ0FBQyxjQUFjLFVBQUE7RUFFL0MsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUUsTUFBTSxDQUFDLFlBQVksTUFBTSxDQUFDLFFBQTVCO0VBQ3pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFFLE1BQU0sQ0FBQyxVQUFUIiwic291cmNlc0NvbnRlbnQiOlsiIyBhdXRvY29tcGlsZVxucmVxdWlyZSEge1xuICB1bmRlcnNjb3JlOiBfXG4gIGhlbHBlcnM6IGhcbn1cblxuQmFja2JvbmUgPSByZXF1aXJlICcuL2pzcGFydCdcbl8uZXh0ZW5kIGV4cG9ydHMsIEJhY2tib25lXG5cbkJhY2tib25lLk1vZGVsLmV4dGVuZDQwMDAgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZDQwMDAgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZDQwMDAgPSAoLi4uY2xhc3NlcykgLT5cbiAgY2xhc3NQcm9wZXJ0aWVzID0ge31cbiAgXG4gIGNsYXNzZXMgPSBfLm1hcCBjbGFzc2VzLCAoY2xzKSAtPlxuICAgIGlmIG5vdCBjbHNcbiAgICAgIGNvbnNvbGUubG9nIFwib25lIG9mIG15IGNsYXNzZXMgaXMgZW1wdHksIHdpbGwgdGhyb3c6XFxuXCIsIGNsYXNzZXNcbiAgICAgIGVyciA9IG5ldyBFcnJvciAnZXh0ZW5kNDAwMCBjYWxsZWQgd2l0aCBhbiBlbXB0eSBjbGFzcydcbiAgICAgIGNvbnNvbGUubG9nIGVyci5zdGFja1xuICAgICAgdGhyb3cgZXJyXG4gICAgaWYgY2xzOjogdGhlbiByZXR1cm4gY2xzOjogZWxzZSBjbHNcblxuICBjbGFzc0luaGVyaXQgPSAoYXR0ck5hbWUpIH4+XG4gICAgbmV3QXR0ciA9IGguZmlsdGVyRmFsc2UgKF8uZmxhdHRlbiBfLnBsdWNrIGNsYXNzZXMsIGF0dHJOYW1lKVxuICAgIGlmIG5ld0F0dHIgdGhlbiByZXR1cm4gY2xhc3NQcm9wZXJ0aWVzW2F0dHJOYW1lXSA9IGgucHVzaCBAW2F0dHJOYW1lXSwgbmV3QXR0clxuICAgIHJldHVybiBAW2F0dHJOYW1lXVxuXG4gICMgc21hcnQgY2xhc3Mgam9pbiB2aWEgbWVyZ2Vyc1xuICBtZXJnZXJzID0gY2xhc3NJbmhlcml0ICdtZXJnZXJzJ1xuICBfLm1hcCBtZXJnZXJzLCAobWVyZ2VyKSB+PiBoLnB1c2htIGNsYXNzZXMsIG1lcmdlci5jYWxsKEAsIGNsYXNzZXMuY29uY2F0KEA6OikpXG5cbiAgIyBtZXJnZSBhbGwgY2xhc3Nlc1xuICBuZXdDbGFzcyA9IF8ucmVkdWNlIGNsYXNzZXMsICgobmV3Q2xhc3MsaW5jbHVkZUNsYXNzKSAtPlxuICAgIG5ld0NsYXNzLmV4dGVuZCBpbmNsdWRlQ2xhc3MpLCBAXG5cbiAgIyBhcHBseSBtZXRhY2xhc3MgdHJhbnNmb3JtYXRpb25zXG4gIHRyYW5zZm9ybWVycyA9IGNsYXNzSW5oZXJpdCAndHJhbnNmb3JtZXJzJ1xuICBuZXdDbGFzcyA9IF8ucmVkdWNlKCAodHJhbnNmb3JtZXJzIG9yIFtdKSwgKChuZXdDbGFzcyx0cmFuc2Zvcm1lcikgfj4gdHJhbnNmb3JtZXIobmV3Q2xhc3MsQCkpLCBuZXdDbGFzcylcblxuICAjIGluaGVyaXQgY2xhc3MgcHJvcGVydGllcyAobWVyZ2VycyBhbmQgdHJhbnNmb3JtZXJzKVxuICBuZXdDbGFzcyA9IG5ld0NsYXNzLmV4dGVuZCB7fSwgY2xhc3NQcm9wZXJ0aWVzXG5cbiAgICBcblN1YkNvbnRleHQgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQ0MDAwKCByZW1vdmU6IC0+IEBzdG9wTGlzdGVuaW5nKCkgKVxuQmFja2JvbmUuTW9kZWw6OnN1YkNvbnRleHQgPSAtPiByZXR1cm4gbmV3IFN1YkNvbnRleHQoKVxuXG5saXN0ZW5NZXRob2RzID0geyBsaXN0ZW5UbzogJ29uJywgbGlzdGVuVG9PbmNlOiAnb25jZSd9O1xuXG5fLmVhY2ggbGlzdGVuTWV0aG9kcywgKGltcGxlbWVudGF0aW9uLCBtZXRob2QpIC0+XG4gIEJhY2tib25lLk1vZGVsOjpbbWV0aG9kXSA9IChvYmosIG5hbWUsIGNhbGxiYWNrKSAtPlxuICAgIGxpc3RlbmluZ1RvID0gQC5fbGlzdGVuaW5nVG8gb3IgQC5fbGlzdGVuaW5nVG8gPSB7fVxuICAgIGlkID0gb2JqLl9saXN0ZW5JZCBvciBvYmouX2xpc3RlbklkID0gXy51bmlxdWVJZCgnbCcpXG5cbiAgICBsaXN0ZW5pbmdUb1tpZF0gPSBvYmpcbiAgICBpZiBub3QgY2FsbGJhY2sgYW5kIHR5cGVvZiBuYW1lIGlzICdvYmplY3QnIHRoZW4gY2FsbGJhY2sgPSBAXG4gICAgaWYgbm90IG9iai5qcXVlcnk/IHRoZW4gb2JqW2ltcGxlbWVudGF0aW9uXSBuYW1lLCBjYWxsYmFjaywgQFxuICAgIGVsc2VcbiAgICAgIGlmIGltcGxlbWVudGF0aW9uIGlzICdvbmNlJ1xuICAgICAgICBvYmoub25lIG5hbWUsIGNhbGxiYWNrXG4gICAgICBlbHNlXG4gICAgICAgIG9ialtpbXBsZW1lbnRhdGlvbl0gbmFtZSwgY2FsbGJhY2sgICAgICBcbiAgICBAXG5cbkJhY2tib25lLk1vZGVsOjp0b0pTT04gPSAtPlxuICBhdHRyID0gQGF0dHJpYnV0ZXNcbiAgaWYgQHN0cmluZ2lmeU9taXQgdGhlbiBhdHRyID0gXy5vbWl0IGF0dHIsIEBzdHJpbmdpZnlPbWl0XG4gIGlmIEBzdHJpbmdpZnlQaWNrIHRoZW4gYXR0ciA9IF8ucGljayBhdHRyLCBAc3RyaW5naWZ5UGlja1xuICBcbiAgXy5tYXBPYmplY3QgYXR0ciwgKHZhbHVlLCBrZXkpIC0+XG4gICAgaWYgdmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgYW5kIHZhbHVlQEAgaXNudCBPYmplY3QgdGhlbiB2YWx1ZS50b0pTT04/IVxuICAgIGVsc2UgdmFsdWVcbiAgICAgICAgICAgIFxuQmFja2JvbmUuTW9kZWw6OnN0b3BMaXN0ZW5pbmcgPSAob2JqLCBuYW1lLCBjYWxsYmFjaykgLT5cbiAgbGlzdGVuaW5nVG8gPSBAX2xpc3RlbmluZ1RvXG4gIGlmIG5vdCBsaXN0ZW5pbmdUbyB0aGVuIHJldHVybiBAXG4gIHJlbW92ZSA9IG5vdCBuYW1lIGFuZCBub3QgY2FsbGJhY2tcblxuICBpZiBub3QgY2FsbGJhY2sgYW5kIHR5cGVvZiBuYW1lIGlzICdvYmplY3QnIHRoZW4gY2FsbGJhY2sgPSBAXG4gIGlmIG9iaiB0aGVuIChsaXN0ZW5pbmdUbyA9IHt9KVtvYmouX2xpc3RlbklkXSA9IG9ialxuXG4gIF8uZWFjaCBsaXN0ZW5pbmdUbywgKG9iaiwgaWQpIH4+IFxuICAgIGlmIG5vdCBvYmouanF1ZXJ5PyB0aGVuIG9iai5vZmYgbmFtZSwgY2FsbGJhY2ssIEBcbiAgICBlbHNlIG9iai5vZmYgbmFtZSwgY2FsbGJhY2tcblxuICAgIGlmIHJlbW92ZSBvciBfLmlzRW1wdHkob2JqLl9ldmVudHMpIHRoZW4gZGVsZXRlIEBfbGlzdGVuaW5nVG9baWRdXG4gIEBcblxubWV0YU1lcmdlciA9IGV4cG9ydHMubWV0YU1lcmdlciA9IHt9XG5cbm1ldGFNZXJnZXIuaXRlcmF0aXZlID0gKG9wdGlvbnMsIGF0dHJOYW1lKSAtLT5cbiAgKGNsYXNzZXMpIC0+XG4gICAgeyByaWdodCA9IGZhbHNlLCBjaGVjaywgam9pbiwgcG9zdEpvaW4gfSA9IG9wdGlvbnNcbiAgICBpZiByaWdodCB0aGVuIGl0ZXJGID0gXy5yZWR1Y2VSaWdodCBlbHNlIGl0ZXJGID0gXy5yZWR1Y2VcbiAgICAgIFxuICAgIGpvaW5lZEF0dHJpYnV0ZSA9IGl0ZXJGIGNsYXNzZXMsICgoam9pbmVkLCBjbHMpIC0+XG4gICAgICBhdHRyID0gY2xzW2F0dHJOYW1lXVxuICAgICAgaWYgbm90IGNoZWNrIG9yIGNoZWNrIGF0dHJcbiAgICAgICAgaWYgam9pbmVkIHRoZW4gam9pbihqb2luZWQsIGF0dHIpIGVsc2UgYXR0clxuICAgICAgZWxzZSBqb2luZWQpLCB2b2lkXG5cbiAgICBpZiBqb2luZWRBdHRyaWJ1dGVcbiAgICAgIHJldCA9IHt9XG4gICAgICByZXRbYXR0ck5hbWVdID0gam9pbmVkQXR0cmlidXRlICAgXG4gICAgICAjIHBvc3Rwcm9jZXNzaW5nP1xuICAgICAgaWYgcG9zdEpvaW4gdGhlbiBwb3N0Sm9pbiByZXQsIGF0dHJOYW1lLCBvcHRpb25zXG4gICAgICBlbHNlIHJldFxuICAgICAgXG4gICAgZWxzZSB2b2lkXG5cblxubWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZUxlZnQgPSBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlID0gbWV0YU1lcmdlci5pdGVyYXRpdmVcblxubWV0YU1lcmdlci5jaGFpbkYgPSBtZXRhTWVyZ2VyLm1lcmdlQXR0cmlidXRlIGNoZWNrOiAoKGYpIC0+IGY/QEAgaXMgRnVuY3Rpb24pLCBqb2luOiAoKGYxLCBmMikgLT4gLT4gZjIoLi4uKTsgZjEoLi4uKSkgIFxubWV0YU1lcmdlci5jaGFpbkZSaWdodCA9IG1ldGFNZXJnZXIubWVyZ2VBdHRyaWJ1dGUgcmlnaHQ6IHRydWUsIGNoZWNrOiAoKGYpIC0+IGY/QEAgaXMgRnVuY3Rpb24pLCBqb2luOiAoKGYxLCBmMikgLT4gLT4gZjIoLi4uKTsgZjEoLi4uKSkgIFxuXG5tZXRhTWVyZ2VyLm1lcmdlRGljdCA9IG1ldGFNZXJnZXIubWVyZ2VBdHRyaWJ1dGUgcmlnaHQ6IHRydWUsIGNoZWNrOiAoKGQpIC0+IGQ/QEAgaXMgT2JqZWN0KSwgam9pbjogKGQxLCBkMikgLT4gXy5leHRlbmQge30sIGQxLCBkMlxubWV0YU1lcmdlci5tZXJnZURpY3REZWVwID0gbWV0YU1lcmdlci5tZXJnZUF0dHJpYnV0ZSByaWdodDogdHJ1ZSwgY2hlY2s6ICgoZCkgLT4gZD9AQCBpcyBPYmplY3QpLCBqb2luOiAoZDEsIGQyKSAtPiBoLmV4dGVuZCBkMSwgZDJcblxubWVyZ2VyID0gZXhwb3J0cy5tZXJnZXIgPSB7fVxuXG5tZXJnZXIuaW5pdGlhbGl6ZSA9IG1ldGFNZXJnZXIuY2hhaW5GICdpbml0aWFsaXplJ1xubWVyZ2VyLmRlZmF1bHRzID0gbWV0YU1lcmdlci5tZXJnZURpY3QgJ2RlZmF1bHRzJ1xubWVyZ2VyLmRlZXBEZWZhdWx0cyA9IG1ldGFNZXJnZXIubWVyZ2VEaWN0RGVlcCAnZGVmYXVsdHMnXG5cbkJhY2tib25lLk1vZGVsLm1lcmdlcnMgPSBbIG1lcmdlci5pbml0aWFsaXplLCBtZXJnZXIuZGVmYXVsdHMgXVxuQmFja2JvbmUuVmlldy5tZXJnZXJzID0gWyBtZXJnZXIuaW5pdGlhbGl6ZSBdXG5cblxuIl19
