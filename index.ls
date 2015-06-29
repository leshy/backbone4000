#!/usr/bin/lsc

{ map, fold1, keys, values, first, flatten } = require 'prelude-ls'

require! {
  colors: colors
  backbone: Backbone
  underscore: _
  helpers: h
}

Backbone.Model.extend4000 = (...classes) ->
  _.map @extenders, (extender) ->    
    newCls = extender.apply @, classes
    if newCls then classes.push newCls

  @extend h.uextend classes    
    
metaExtender = {}

metaExtender.mergeAttribute = (validate,join,name) -->
  (...classes) ->
    joinedAttribute = _.reduce classes, ((joined, cls) ->
      attr = cls[name]
      if not validate or validate attr
        if joined then join(joined, attr) else attr
      else joined), void
      
    if joinedAttribute
      ret = {}
      ret[name] = joinedAttribute
      ret
    else void


metaExtender.chainF = metaExtender.mergeAttribute ((f) -> f?@@ is Function), (f1, f2) -> f1 >> f2
  
metaExtender.mergeDict = metaExtender.mergeAttribute ((d) -> d?@@ is Object), (d1, d2) -> _.extend {}, d1, d2
metaExtender.mergeDictDeep = metaExtender.mergeAttribute ((d) -> d?@@ is Object), (d1, d2) -> h.extend d1, d2

extender = {}

extender.initialize = metaExtender.chainF 'initialize'
extender.defaults = metaExtender.mergeDict 'defaults'
extender.deepDefaults = metaExtender.mergeDictDeep 'defaults'

Backbone.Model.extenders = [ extender.initialize ]
Backbone.Model.meta = [ ]

metaClassers = {}

_.extend exports, Backbone