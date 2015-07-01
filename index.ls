#!/usr/bin/lsc

{ map, fold1, keys, values, first, flatten } = require 'prelude-ls'

require! {
  underscore: _
  helpers: h
  colors: colors
}

Backbone = require './jspart'

Backbone.Model.extend4000 = Backbone.View.extend4000 = Backbone.Collection.extend4000 = (...classes) ->
  classProperties = {}

  classInherit = (attrName) ~>
    newAttr = h.filterFalse (_.flatten _.pluck classes, attrName)
    if newAttr then return classProperties[attrName] = h.push @[attrName], newAttr
    return @[attrName]
    
  
  # smart class join via mergers
  mergers = classInherit 'mergers'
  _.map mergers, (merger) ~> h.pushm classes, merger.call @, classes
  
  # merge all classes
  newClass = h.uextend classes
    
  # apply metaclass transformations
  transformers = classInherit 'transformers'
  newClass = _.reduce( (transformers or []), ((newClass,transformer) ~> transformer(newClass,@)), newClass)
  
  @extend newClass, classProperties


metaMerger = exports.metaMerger = {}

metaMerger.mergeAttribute = (validate,join,name) -->
  (classes) ->
    classes = h.push classes, @::
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

metaMerger.chainF = metaMerger.mergeAttribute ((f) -> f?@@ is Function), (f1, f2) -> f1 >> f2
metaMerger.mergeDict = metaMerger.mergeAttribute ((d) -> d?@@ is Object), (d1, d2) -> _.extend {}, d1, d2  
metaMerger.mergeDictDeep = metaMerger.mergeAttribute ((d) -> d?@@ is Object), (d1, d2) -> h.extend d1, d2





merger = exports.merger = {}

merger.initialize = metaMerger.chainF 'initialize'
merger.defaults = metaMerger.mergeDict 'defaults'
merger.deepDefaults = metaMerger.mergeDictDeep 'defaults'

Backbone.Model.mergers = [ merger.initialize, merger.defaults ]


_.extend exports, Backbone
