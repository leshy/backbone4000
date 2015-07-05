backbone = require './index'
  
exports.basicExtend = (test) ->
  A = backbone.Model.extend4000(
    { initialize: -> console.log 1 }
    { initialize: -> console.log 2 }
    { bla: 666} )
    
  a = new A()
    
  test.done()


exports.basicMetaClass = (test) ->
  A = backbone.Model.extend4000(
    { initialize: -> console.log 1 }
    { initialize: -> console.log 2 }
    { bla: 666}
    { transformers: (cls) -> cls::bla *= 2; cls } )

    
  a = new A()

  test.equals a.bla, 1332
  test.done()


exports.init = (test) ->
  A = backbone.Model.extend4000(
    {
      initialize: -> console.log 'initargs', it
      testf: -> console.log 'testf a1'
    },
    
    {
      initialize: -> console.log 'getbla', @bla
      testf: -> console.log 'testf a2'
    })


  B = backbone.Model.extend4000({
    initialize: ->
      console.log "VALIDATOR", @bla, @get 'bla'
      
    testf: ->
      console.log 'testf b'
      @_super 1,2
      return 3
  })
  
  C = A.extend4000( B, {
    bla: 6
  })



  c = new C bla: 666

  console.log c.testf()
  
  test.done()