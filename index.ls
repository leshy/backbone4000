#!/usr/bin/lsc

{ map, fold1, keys, values, first, flatten } = require 'prelude-ls'

require! {
  underscore: _
  helpers: h
}

Backbone = require './jspart'

Backbone.Model.extend4000 = Backbone.View.extend4000 = Backbone.Collection.extend4000 = (...classes) ->
  _.map @extenders, (extender) -> h.pushm classes, extender(classes)

  newClass = h.uextend classes

  _.map newClass.meta, (morpher) -> morpher(newClass)
  
  @extend newClass

metaExtender = {}

metaExtender.mergeAttribute = (validate,join,name) -->
  (classes) ->
    joinedAttribute = _.reduce classes, ((joined, cls) ->
      if cls:: then cls = cls::
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