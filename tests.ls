Backbone = require './extras'
util = require 'util'
colors = require 'colors'
h = require 'helpers'
_ = require 'underscore'
$ = require 'jquery'
  
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
  return test.done()
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
  test.equals a.totalLength, 3
  
  testModel2.trigger "some_model_event", true, 3
  a.remove "blu", testModel3
  test.equals a.totalLength, 2
  
  #console.log util.inspect events, colors: true, depth: 3
  
  
  test.deepEqual events, do
    addCollection: [ [ 'bla' ], [ 'blu' ] ],
    addModel: 
     [ [ 'bla', 'testmodel1' ],
       [ 'bla', 'testmodel2' ],
       [ 'blu', 'testmodel3' ] ],
    childAdd: 
     [ [ 'bla', 'testmodel1' ],
       [ 'bla', 'testmodel2' ],
       [ 'blu', 'testmodel3' ] ],
    change: [ [ true ], [ true ], [ true ], [ true ] ],
    some_model_event: [ [ [ true, 3 ] ] ],
    delModel: [ [ 'blu', 'testmodel3' ] ],
    childRemove: [ [ 'blu', 'testmodel3' ] ],
    removeCollection: [ [ 'blu' ] ]
  test.done()


exports.mergers = (test) ->
  res = {}

  testA = []
    
  A = Backbone.Model.extend4000 do
      initialize: ->
        testA.push 'i1'
      test: -> testA.push '1'; @x = 1
      
  A.mergers.push Backbone.metaMerger.chainFRight 'test'

  B = A.extend4000(
    {
      initialize: -> testA.push 'i2'
      test: -> testA.push '2'; @x = 2
    },
    
    {
      initialize: -> testA.push 'i3'
      test: -> testA.push '3'; @x = 3
    })

  C = B.extend4000 do
    initialize: -> testA.push 'i4'
    test: -> testA.push '4'; @x = 4


  c = new C()
  c.test()
  test.deepEqual testA, [ 'i1', 'i3', 'i2', 'i4', '4', '2', '3', '1' ]
#  test.equals c.x, 1
  test.done()




exports.listenToJquery = (test) ->
  require('jsdom').env do
    '<html><body><h1>hi there</h1></body></html>'
    (error, window) ->      
      $ = require('jquery') window
      model = new Backbone.Model()
      once = false
      cnt = 0
      h1 = $('h1')
      model.listenTo h1, 'click', (el, event) ->
        cnt := cnt + 1

        if cnt is 2
          model.stopListening()
          model.listenToOnce h1, 'click', (el, event) ->
            once := true
            


      h1.trigger 'click', { some: 'data1' }
      h1.trigger 'click', { some: 'data2' }
      h1.trigger 'click', { some: 'data3' }
      h1.trigger 'click', { some: 'data4' }
      test.equals once, true
      test.done()

