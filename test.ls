Backbone = require './index'

require('jsdom').env do
  '<html><body><h1>hi there</h1></body></html>'
  (error, window) ->      
    $ = require('jquery') window
    a = new Backbone.Model()
    a.listenTo $('h1'), 'click', ->
      a.stopListening()
      $('h1').trigger 'click', { some: 'data' }

    #$('h1').on 'click', (element, event) -> console.log event
    $('h1').trigger 'click', { some: 'data' }

