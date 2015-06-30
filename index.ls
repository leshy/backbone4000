#!/usr/bin/lsc

{ map, fold1, keys, values, first, flatten } = require 'prelude-ls'

require! {
  underscore: _
  helpers: h
}

Backbone = require './jspart'

Backbone.Model.extend4000 = Backbone.View.extend4000 = Backbone.Collection.extend4000 = (...classes) ->

  # smart class join
  _.map (h.push @extenders, _.pluck classes, 'extenders'), (extender) ->
    h.pushm classes, extender(classes)

  # merge
  newClass = h.uextend classes
  # join metaclass transformations
  newClass = h.uextend newClass, { metaClass: h.push(newClass.metaClass, @::metaClass) }
  # apply metaclass transformations
  newClass = _.reduce( (newClass.metaClass or []), ((newClass,morpher) ~> morpher(newClass,@)), newClass)

  @extend newClass



metaExtender = exports.metaExtender = {}

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
metaExtender.mergeDict = metaExtender.mergeAttribute ((d) ->
  d?@@ is Object), (d1, d2) ->
  console.log 'merging!',d1,d2
  _.extend {}, d1, d2
metaExtender.mergeDictDeep = metaExtender.mergeAttribute ((d) -> d?@@ is Object), (d1, d2) -> h.extend d1, d2

extender = exports.extender = {}

extender.initialize = metaExtender.chainF 'initialize'
extender.defaults = metaExtender.mergeDict 'defaults'
extender.deepDefaults = metaExtender.mergeDictDeep 'defaults'

Backbone.Model.extenders = [ extender.initialize, extender.defaults ]


_.extend exports, Backbone
