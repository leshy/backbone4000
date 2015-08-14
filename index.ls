#!/usr/bin/lsc
require! {
  underscore: _
  helpers: h
}

Backbone = require './jspart'
_.extend exports, Backbone

Backbone.Model.extend4000 = Backbone.View.extend4000 = Backbone.Collection.extend4000 = (...classes) ->
  classProperties = {}

  classes = _.map classes, (cls) ->
    if not cls
      console.log "one of my classes is empty, will throw:\n", classes
      throw new Error 'extend4000 called with an empty class'
    if cls:: then return cls:: else cls

  classInherit = (attrName) ~>
    newAttr = h.filterFalse (_.flatten _.pluck classes, attrName)
    if newAttr then return classProperties[attrName] = h.push @[attrName], newAttr
    return @[attrName]

  # smart class join via mergers
  mergers = classInherit 'mergers'
  _.map mergers, (merger) ~> h.pushm classes, merger.call(@, classes.concat(@::))

  # merge all classes
  newClass = _.reduce classes, ((newClass,includeClass) ->
    newClass.extend includeClass), @

  # apply metaclass transformations
  transformers = classInherit 'transformers'
  newClass = _.reduce( (transformers or []), ((newClass,transformer) ~> transformer(newClass,@)), newClass)

  # inherit class properties (mergers and transformers)
  newClass = newClass.extend {}, classProperties

    
SubContext = Backbone.Model.extend4000( remove: -> @stopListening() )
Backbone.Model::subContext = -> return new SubContext()

metaMerger = exports.metaMerger = {}

metaMerger.merge = (fifo, validate, join, attrName) -->
  (classes) ->
    if fifo then iter = _.reduceRight else iter = _.reduce
    joinedAttribute = iter classes, ((joined, cls) ->
      attr = cls[attrName]
      if not validate or validate attr
        if joined then join(joined, attr) else attr
      else joined), void

    if joinedAttribute
      ret = {}
      ret[attrName] = joinedAttribute
      ret
    else void

metaMerger.mergeAttribute = metaMerger.merge false
metaMerger.mergeAttributeFifo = metaMerger.merge true
metaMerger.mergeAttributeLifo = metaMerger.merge false

metaMerger.chainF = metaMerger.mergeAttribute ((f) -> f?@@ is Function), ((f1, f2) -> -> f2(...); f1(...))
metaMerger.mergeDict = metaMerger.mergeAttributeFifo ((d) -> d?@@ is Object), (d1, d2) -> _.extend {}, d1, d2
metaMerger.mergeDictDeep = metaMerger.mergeAttributeFifo ((d) -> d?@@ is Object), (d1, d2) -> h.extend d1, d2

merger = exports.merger = {}

merger.initialize = metaMerger.chainF 'initialize'
merger.defaults = metaMerger.mergeDict 'defaults'
merger.deepDefaults = metaMerger.mergeDictDeep 'defaults'

Backbone.Model.mergers = [ merger.initialize, merger.defaults ]
Backbone.View.mergers = [ merger.initialize ]


