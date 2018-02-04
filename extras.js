(function(){
  var _, Backbone, OrderedDict, ChildCollection, CollectionCollection, Tagged, AttrTagged, MotherShip;
  _ = require('underscore');
  import$(exports, Backbone = require('./index'));
  OrderedDict = exports.OrderedDict = Backbone.Model.extend4000({
    constructor: function(){
      var initValues, res$, i$, to$;
      res$ = [];
      for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      initValues = res$;
      return Backbone.Model.apply(this, [void 8].concat(initValues));
    },
    initialize: function(arg$){
      var initValues, res$, i$, to$, this$ = this;
      res$ = [];
      for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      initValues = res$;
      this.order = [];
      this.on('change', function(model){
        var this$ = this;
        return _.map(model.changed, function(value, key){
          if (!model._previousAttributes[key]) {
            return this$.order.push(key);
          }
        });
      });
      return _.map(initValues, function(it){
        return this$.set(it);
      });
    },
    map: function(cb){
      var this$ = this;
      return _.map(this.order, function(key){
        return cb(this$.get(key), key);
      });
    }
  });
  ChildCollection = Backbone.Model.extend4000({
    initialize: function(id){
      var this$ = this;
      this.cid = this.id = id;
      this.c = new Backbone.Collection();
      return this.c.on('all', function(){
        return this$.trigger.apply(this$, arguments);
      });
    },
    add: function(){
      var args, res$, i$, to$;
      res$ = [];
      for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      args = res$;
      return this.c.add.apply(this.c, args);
    },
    remove: function(){
      var args, res$, i$, to$;
      res$ = [];
      for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      args = res$;
      return this.c.remove.apply(this.c, args);
    }
  });
  CollectionCollection = exports.CollectionCollection = Backbone.Collection.extend({
    totalLength: 0,
    add: function(index){
      var models, res$, i$, to$, collection, this$ = this;
      res$ = [];
      for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      models = res$;
      if (!(collection = this.get(index))) {
        Backbone.Collection.prototype.add.call(this, collection = new ChildCollection(index));
        this.listenTo(collection, 'add', function(model){
          this$.totalLength++;
          this$.trigger('childAdd', model, collection);
          return this$.trigger('change', 'add', model, collection);
        });
        this.listenTo(collection, 'remove', function(model){
          this$.totalLength--;
          this$.trigger('childRemove', model, collection);
          return this$.trigger('change', 'remove', model, collection);
        });
      }
      return collection.add(models);
    },
    remove: function(index){
      var models, res$, i$, to$, collection;
      res$ = [];
      for (i$ = 1, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      models = res$;
      if (!(collection = this.get(index))) {
        throw new Error("no collection at " + index);
      }
      collection.remove(models);
      if (!collection.length) {
        Backbone.Collection.prototype.remove.call(this, collection, {
          silent: true
        });
        this.stopListening(collection);
        return this.trigger('remove', collection);
      }
    }
  });
  Tagged = exports.Tagged = Backbone.Model.extend4000({
    forktags: function(){
      if (this.constructor.prototype.tags === this.tags) {
        if (this.tags) {
          return this.tags = _.extend({}, this.tags);
        } else {
          return this.tags = {};
        }
      }
    },
    delTag: function(tag){
      var data;
      this.forktags();
      data = this.tags[tag];
      delete this.tags[tag];
      this.trigger('changeTag', 'del', tag, data);
      this.trigger('delTag', tag, data);
      return this.trigger('delTag:' + tag, data);
    },
    addTag: function(tag, data){
      data == null && (data = true);
      if (this.hasTag[tag]) {
        return;
      }
      this.forktags();
      this.tags[tag] = data;
      this.trigger('changeTag', 'add', tag, data);
      this.trigger('addTag', tag, data);
      return this.trigger('addTag:' + tag, data);
    },
    changeTags: function(){
      var tags, res$, i$, to$;
      res$ = [];
      for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      tags = res$;
      this.forktags();
      tags = _.flatten(tags);
      throw Error('unimplemented');
    },
    addTags: function(){
      var tags, res$, i$, to$, this$ = this;
      res$ = [];
      for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      tags = res$;
      tags = _.flatten(tags);
      return _.each(tags, function(it){
        return this$.addTag(it);
      });
    },
    delTags: function(){
      var tags, res$, i$, to$, this$ = this;
      res$ = [];
      for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      tags = res$;
      tags = _.flatten(tags);
      return _.each(tags, function(it){
        return this$.delTag(it);
      });
    },
    hasTag: function(){
      var tags, res$, i$, to$, this$ = this;
      res$ = [];
      for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      tags = res$;
      tags = _.flatten(tags);
      return !_.find(tags, function(tag){
        var ref$;
        return !((ref$ = this$.tags) != null && ref$[tag]);
      });
    },
    hasTagOr: function(){
      var tags, res$, i$, to$;
      res$ = [];
      for (i$ = 0, to$ = arguments.length; i$ < to$; ++i$) {
        res$.push(arguments[i$]);
      }
      tags = res$;
      return _.find(_.keys(this.tags), function(tag){
        return in$(tag, tags);
      });
    }
  });
  AttrTagged = exports.AttrTagged = Tagged.extend4000({
    forktags: function(){
      this.tags = this.get('tags');
      if (!this.tags) {
        this.set({
          tags: this.tags = {}
        });
      }
      if (this.touch) {
        return this.touch('tags');
      }
    }
  });
  MotherShip = exports.MotherShip = function(name){
    var ref$;
    return Backbone.Model.extend4000((ref$ = {
      initialize: function(){
        return this[name + "s"] = this.collection = new Backbone.Collection();
      }
    }, ref$[name + ""] = function(instanceName, attributes){
      var instance, instanceClass;
      attributes == null && (attributes = {});
      if (instance = this.collection.get(instanceName)) {
        return instance;
      }
      instanceClass = this[name + "Class"];
      if (!instanceClass) {
        throw "I don't have " + name + "Class attribute defined";
      }
      instance = new instanceClass(import$({
        parent: this,
        id: instanceName
      }, attributes));
      return this.collection.add(instance);
    }, ref$.add = function(instanceName, instance){
      instance.id = instanceName;
      return this.collection.add(instance);
    }, ref$));
  };
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);
