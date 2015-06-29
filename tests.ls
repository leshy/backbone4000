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
    { metaClass: (cls) -> cls.bla *= 2; cls } )

    
  a = new A()

  test.equals a.bla, 1332
  test.done()