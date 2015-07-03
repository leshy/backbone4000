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
    { transformers: (cls) -> cls.bla *= 2; cls } )

    
  a = new A()

  test.equals a.bla, 1332
  test.done()


exports.init = (test) ->
  A = backbone.Model.extend4000(
    { initialize: -> console.log 'initargs', it }
    { initialize: -> console.log 'getbla', @bla})


  B = backbone.Model.extend4000({
    initialize: ->
      console.log "VALIDATOR", @bla, @get 'bla'
  })
  
  C = A.extend4000( B, {
    bla: 6
  })

  c = new C bla: 666


  test.done()