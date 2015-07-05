#!/usr/bin/lsc

{ map, fold1, keys, values, first, flatten } = require 'prelude-ls'

require! {
  underscore: _
  helpers: h
}

Backbone = require './jspart'

Backbone.Model.extend4000 = Backbone.View.extend4000 = Backbone.Collection.extend4000 = (...classes) ->
  classProperties = {}

  classes = _.map classes, (cls) ->
    if cls:: then return cls:: else cls

  classes = h.unshift classes, @::

  classInherit = (attrName) ~>
    newAttr = h.filterFalse (_.flatten _.pluck classes, attrName)
    if newAttr then return classProperties[attrName] = h.push @[attrName], newAttr
    return @[attrName]

  # smart class join via mergers
  mergers = classInherit 'mergers'
  _.map mergers, (merger) ~> h.pushm classes, merger.call @, classes

  # merge all classes
  newClass = _.reduce classes, ((newClass,includeClass) ->
    console.log 'extend with', includeClass
    newClass.extend includeClass), @

  # apply metaclass transformations
  transformers = classInherit 'transformers'
  newClass = _.reduce( (transformers or []), ((newClass,transformer) ~> transformer(newClass,@)), newClass)

  # inherit class properties (mergers and transformers)
  newClass = newClass.extend {}, classProperties


Backbone.Model::_super2 = (methodName, ...args) ->
  
  findMethod = (methodName, target) ->
    console.log 'findMethod',methodName
    
    if target[methodName]?@@ is Function then target
    else findMethod methodName, target.constructor.__super__

  
  searchTarget = (findMethod methodName, @).constructor.__super__ # find first one, and ignore it.

  console.log 'found first one, looking for second', searchTarget
  #findMethod(methodName, searchTarget)[methodName].apply @, args
  console.log findMethod(methodName, searchTarget)[methodName]
  


metaMerger = exports.metaMerger = {}

metaMerger.mergeAttribute = (validate,join,name) -->
  (classes) ->
    joinedAttribute = _.reduce classes, ((joined, cls) ->
      attr = cls[name]
      if not validate or validate attr
        if joined then join(joined, attr) else attr
      else joined), void

    if joinedAttribute
#      ret = { name: 'j_' + name }
      ret = {}
      ret[name] = joinedAttribute
      ret
    else void

metaMerger.chainF = metaMerger.mergeAttribute ((f) -> f?@@ is Function), (f1, f2) -> -> f1(...); f2(...)
metaMerger.mergeDict = metaMerger.mergeAttribute ((d) -> d?@@ is Object), (d1, d2) -> _.extend {}, d1, d2
metaMerger.mergeDictDeep = metaMerger.mergeAttribute ((d) -> d?@@ is Object), (d1, d2) -> h.extend d1, d2




merger = exports.merger = {}

merger.initialize = metaMerger.chainF 'initialize'
merger.defaults = metaMerger.mergeDict 'defaults'
merger.deepDefaults = metaMerger.mergeDictDeep 'defaults'

Backbone.Model.mergers = [ merger.initialize, merger.defaults ]




_.extend exports, Backbone
