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



CollectionWrapper = Backbone.Model.extend4000 do
  initialize: -> 
    if not @collection = @get 'collection' then @set collection: @collection = new Backbone.Collection()


ChildCollection = Backbone.Model.extend4000 do
  initialize: (id) ->
    @cid = @id = id
    @c = new Backbone.Collection()
    @c.on 'all', ~> @trigger ...
  
  add: (...args) -> @c.add.apply @c, args
  remove: (...args) -> @c.remove.apply @c, args
  
CollectionCollection = exports.CollectionCollection = Backbone.Collection.extend do

  add: (index, ...models) ->
    if not collection = @get(index)
      Backbone.Collection::add.call @, collection = new ChildCollection(index)
      
    collection.add models
    
  remove: (index, ...models) ->
    if not collection = @get(index) then throw new Error "no collection at #{index}"
    collection.remove models
    
    if not collection.length
      Backbone.Collection::remove.call @, collection, silent: true
      @trigger 'remove', collection
        
  
