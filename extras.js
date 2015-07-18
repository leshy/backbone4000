// Generated by LiveScript 1.4.0
(function(){
  var _, Backbone, OrderedDict, slice$ = [].slice;
  _ = require('underscore');
  Backbone = require('./index');
  _.extend(exports, Backbone);
  OrderedDict = exports.OrderedDict = Backbone.Model.extend4000({
    constructor: function(){
      var initValues;
      initValues = slice$.call(arguments);
      return Backbone.Model.apply(this, [void 8].concat(initValues));
    },
    initialize: function(arg$){
      var initValues, this$ = this;
      initValues = slice$.call(arguments, 1);
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
}).call(this);
