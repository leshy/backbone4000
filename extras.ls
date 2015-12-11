require! {
  underscore: _
}

Backbone = require './index'

_.extend exports, Backbone

#
# wait, this could be replaces by the vanilla backbone collection? it supports sorting
# 
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



#
# collection that holds other collections. this is so dumb, should be supported by default to arbitrary depth
# should play with backbone.model that inherits from the collection to achieve this
# 
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


# hasTag(tags...)
# hasTagOr(tags...)
# addtag(tags...)
# deltag(tags...)
Tagged = exports.Tagged = Backbone.Model.extend4000 do
    # will create a new tags object for this particular state instance.
    forktags: ->
      if @constructor::tags is @tags
        if @tags then @tags = _.extend {}, @tags else @tags = {}

    delTag: (tag) ->
        @forktags()
        data = @tags[tag]
        delete @tags[tag]
        @trigger 'changeTag', 'del', tag, data
        @trigger 'delTag', tag, data
        @trigger 'delTag:' + tag, data

    addTag: (tag, data = true) ->
        if @hasTag[tag] then return
        @forktags()
        @tags[tag] = data
        @trigger 'changeTag', 'add', tag, data
        @trigger 'addTag', tag, data
        @trigger 'addTag:' + tag, data

    changeTags: (...tags) ->
      @forktags()
      tags = _.flatten tags
      ...
      
    addTags: (...tags) ->
      tags = _.flatten tags
      _.each tags, ~> @addTag it

    hasTag: (...tags) ->
      tags = _.flatten tags
      not _.find(tags, (tag) ~> not @tags?[tag])

    hasTagOr: (...tags) -> _.find _.keys(@tags), (tag) -> tag in tags

# like tagged but keeps its tags in @attributes
AttrTagged = exports.AttrTagged = Tagged.extend4000 do
  initialize: ->
    @tags = @get 'tags'
    
  forktags: ->
    if not @tags then @set tags: @tags = {}
    if @touch then @touch 'tags' # for remotemodel, register the change

