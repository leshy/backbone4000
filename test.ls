backbone = require './index'

A = exports.A = backbone.Model.extend4000(
  {
    _name: 'A1'
    initialize: -> console.log 'initargs', it
    testf: -> console.log 'testf a1'
  },

  {
    _name: 'A2'
    initialize: -> console.log 'getbla', @bla
    testf: -> console.log 'testf a2'
  })


B = exports.B = A.extend4000({
  _name: 'B'
  initialize: ->
    console.log "VALIDATOR", @bla, @get 'bla'
  
  testf: ->
    console.log 'testf b called'
    @_super 'testf', 1, 2
    return 3
})


C = exports.C = B.extend4000({
  _name: 'C'
  bla: 6
})


c = new C bla: 666



console.log c.testf()
