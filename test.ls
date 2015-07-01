_ = require 'underscore'

bla = ->
  @x = 3

bla::extend (dict={}) ->
  n = -> _.extend @, dict 
  n:: = @
  n

a = new bla()
console.log a.x,

blu = bla.extend { y: 5}