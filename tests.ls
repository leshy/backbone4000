backbone = require './index'
  
exports.basicExtend = (test) ->
  res = {}
  
  A = backbone.Model.extend4000(
    { initialize: -> res.a1 = 1 }
    { initialize: -> res.a2 = 2 }
    { bla: 666} )
    
  a = new A()
  
  test.deepEqual res, { a1: 1, a2: 2 }
  test.equals a.bla, 666
  test.done()


exports.metaClass = (test) ->
  res = {}
  
  A = backbone.Model.extend4000(
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
  A = backbone.Model.extend4000(
    initialize: -> res.a1 = 1)

  B = A.extend4000(
    initialize: -> res.a2 = 2)

  b = new B()
  test.deepEqual res, { a1: 1, a2: 2 }
  
  test.done()

  
exports.properSuper = (test) ->
  res = {}
  A = backbone.Model.extend4000(
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


  B = backbone.Model.extend4000({
    initialize: ->
      res.b1 = it
      
    testf: ->
      res.tb = it
      @_super 'testf', 'supercall'
  })
  
  C = A.extend4000( B, {
    bla: 1
  })

  c = new C bla: 2

  c.testf('hi there')


  test.deepEqual res, { b1: { bla: 2 }, a1: { bla: 2 }, a1bla: 1, a2: { bla: 2 }, a2bla: 1, tb: 'hi there', ta2: 'supercall' }
      
  test.done()