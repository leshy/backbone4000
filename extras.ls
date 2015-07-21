require! {
  underscore: _
  colors
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
      

  map: (cb) -> _.map @order, (key) ~> cb @get(key), key



ChildCollection = Backbone.Model.extend4000 do
  initialize: (id) ->
    @cid = @id = id
    @c = new Backbone.Collection()
    @c.on 'all', ~> @trigger ...
  
  add: (...args) -> @c.add.apply @c, args
  remove: (...args) -> @c.remove.apply @c, args
  
CollectionCollection = exports.CollectionCollection = Backbone.Collection.extend do
  totalLength: 0
  
  add: (index, ...models) ->
    if not collection = @get(index)
      Backbone.Collection::add.call @, collection = new ChildCollection(index)
      @listenTo collection, 'add', (model) ~>
        @totalLength++
        @trigger 'childAdd', model, collection
        @trigger 'change', 'add', model, collection
        
      @listenTo collection, 'remove', (model) ~>
        @totalLength--
        @trigger 'childRemove', model, collection
        @trigger 'change', 'remove', model, collection
      
    collection.add models

  remove: (index, ...models) ->
    if not collection = @get(index) then throw new Error "no collection at #{index}"
    collection.remove models
    
    if not collection.length
      Backbone.Collection::remove.call @, collection, silent: true
      @stopListening collection
      @trigger 'remove', collection
        
  
