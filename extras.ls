require! {
  underscore: _
}

Backbone = require './index'

_.extend exports, Backbone

OrderedDict = exports.OrderedDict = Backbone.Model.extend4000 do
  # avoid bb model init attribute setting
  constructor: (...initValues) -> Backbone.Model.apply @, [ void ].concat initValues

  initialize: (void, ...initValues) ->
    @order = []
    
    @on 'change', (model) ->
      _.map model.changed, (value, key) ~> 
        if not model._previousAttributes[key] then @order.push key

    _.map initValues, ~> @set it
      

  map: (cb) ->
    _.map @order, (key) ~> cb @get(key), key
    
