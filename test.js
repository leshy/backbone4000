// Generated by LiveScript 1.4.0
(function(){
  var _, bla, a, blu;
  _ = require('underscore');
  bla = function(){
    return this.x = 3;
  };
  bla.prototype.extend(function(dict){
    var n;
    dict == null && (dict = {});
    n = function(){
      return _.extend(this, dict);
    };
    n.prototype = this;
    return n;
  });
  a = new bla();
  console.log(a.x, blu = bla.extend({
    y: 5
  }));
}).call(this);