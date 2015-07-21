Backbone = require './extras'
util = require 'util'
colors = require 'colors'
h = require 'helpers'
_ = require 'underscore'
  
exports.basicExtend = (test) ->
  res = {}
  
  A = Backbone.Model.extend4000(
    { initialize: -> res.a1 = 1 }
    { initialize: -> res.a2 = 2 }
    { bla: 666} )
    
  a = new A()
  
  test.deepEqual res, { a1: 1, a2: 2 }
  test.equals a.bla, 666
  test.done()


exports.metaClass = (test) ->
  res = {}
  
  A = Backbone.Model.extend4000(
    { initialize: -> res.a1 = 1 }
    { initialize: -> res.a2 = 2 }
    { bla: 666}
    { transformers: (cls) -> cls::bla *= 2; cls } )
  
    
  a = new A()
  test.deepEqual res, { a1: 1, a2: 2 }
  test.equals a.bla, 1332
  test.done()

exports.inherit = (test) ->
  res = {}
  A = Backbone.Model.extend4000(
    initialize: -> res.a1 = 1)

  B = A.extend4000(
    initialize: -> res.a2 = 2)

  b = new B()
  test.deepEqual res, { a1: 1, a2: 2 }
  
  test.done()

  
exports.properSuperAndSuch = (test) ->
  res = {}
  A = Backbone.Model.extend4000(
    {
      initialize: ->
        res.a1 = it
        res.a1bla = @bla
        
      testf: ->
        res.ta1 = it
    },
    
    {
      initialize: ->
        res.a2 = it
        res.a2bla = @bla
        
      testf: ->
        res.ta2 = it
    })


  B = Backbone.Model.extend4000({
    initialize: ->
      res.b1 = it
      
    testf: ->
      res.tb = it
      @_super 'testf', 'supercall'
  })
  
  C = A.extend4000( B, {
    initialize: ->
      res.c1 = it
    bla: 1
  })

  c = new C bla: 2

  c.testf('hi there')

  console.log util.inspect res, colors: true
  test.deepEqual res, { c1: { bla: 2 }, b1: { bla: 2 }, a1: { bla: 2 }, a1bla: 1, a2: { bla: 2 }, a2bla: 1, tb: 'hi there', ta2: 'supercall' }
      
  test.done()


exports.collectionCollection = (test) ->
  a = new Backbone.CollectionCollection()

  events = {}
  
  event = (name,...data) ->
    h.dictpush events,name,data
    console.log.apply console, [ colors.green(name) ].concat data

  a.on 'some_model_event', (...args) ->
    event 'some_model_event', args

  a.on 'childAdd', (model, collection) ->
    event 'childAdd', collection.id, model.id

  a.on 'childRemove', (model,collection) ->
    event 'childRemove', collection.id, model.id

  a.on 'change', (...args) ->
    console.log 'change'
    event 'change', true
        
  a.on 'add', (cc) ->
    event 'addCollection' cc.id
    
    cc.on 'add', (model) ->
      event 'addModel', cc.id, model.id
      
    cc.on 'remove', (model) ->
      event 'delModel', cc.id, model.id

  a.on 'remove', (elem) ->
    test.equals elem.id, 'blu'
    event 'removeCollection' elem.id
        
  a.add "bla", testModel1 = new Backbone.Model( id: 'testmodel1', bla: 3 )
  a.add "bla", testModel2 = new Backbone.Model( id: 'testmodel2', bla: 4 )
  a.add "blu", testModel3 = new Backbone.Model( id: 'testmodel3', blu: 1 )
  testModel2.trigger "some_model_event", true, 3
  a.remove "blu", testModel3
  
  console.log util.inspect a, colors: true, depth: 3
  
  return test.done()
  
  test.deepEqual events, do
    addCollection: [ [ 'bla' ], [ 'blu' ] ],
    addModelRaw: [
      [ 'bla', 'testmodel1' ],
      [ 'bla', 'testmodel2' ],
      [ 'blu', 'testmodel3' ] ],
    modelEvent: [ [ [ true, 3 ] ] ],
    delModelRaw: [ [ 'blu', 'testmodel3' ] ],
    removeCollection: [ [ 'blu' ] ] 

  test.done()
