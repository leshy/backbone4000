// Generated by LiveScript 1.4.0
(function(){
  var Backbone;
  Backbone = require('./index');
  console.log(Backbone);
  require('jsdom').env('<html><body><h1>hi there</h1></body></html>', function(error, window){
    var $, a;
    $ = require('jquery')(window);
    a = new Backbone.Model();
    a.listenTo($('h1'), 'click', function(){
      console.log('bla');
      return a.stopListening();
    });
    return $('h1').trigger('click', {
      some: 'data'
    });
  });
}).call(this);
