backbone = require './index'
  
exports.bla = (test) ->
  A = backbone.Model.extend4000(
    { initialize: -> console.log 1 },
    { initialize: -> console.log 2 },
    { bla: 666} )
    
  a = new A()
    
  test.done()