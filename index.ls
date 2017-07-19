# autocompile
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
      err = new Error 'extend4000 called with an empty class'
      console.log err.stack
      throw err
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

listenMethods = { listenTo: 'on', listenToOnce: 'once'};

_.each listenMethods, (implementation, method) ->
  Backbone.Model::[method] = (obj, name, callback) ->
    listeningTo = @._listeningTo or @._listeningTo = {}
    id = obj._listenId or obj._listenId = _.uniqueId('l')

    listeningTo[id] = obj
    if not callback and typeof name is 'object' then callback = @
    if not obj.jquery? then obj[implementation] name, callback, @
    else
      if implementation is 'once'
        obj.one name, callback
      else
        obj[implementation] name, callback      
    @

Backbone.Model::toJSON = ->
  attr = @attributes
  
  if @stringifyOmit then attr = _.omit attr, @stringifyOmit
  if @stringifyPick then attr = _.pick attr, @stringifyPick
    
  @stringifyParse attr
  
Backbone.Model::stringifyParse = (attr) ->
  _.mapObject attr, (value, key) ->
    if value instanceof Object and value@@ isnt Object then value.toJSON?!
    else value  
            
Backbone.Model::stopListening = (obj, name, callback) ->
  listeningTo = @_listeningTo
  if not listeningTo then return @
  remove = not name and not callback

  if not callback and typeof name is 'object' then callback = @
  if obj then (listeningTo = {})[obj._listenId] = obj

  _.each listeningTo, (obj, id) ~> 
    if not obj.jquery? then obj.off name, callback, @
    else obj.off name, callback

    if remove or _.isEmpty(obj._events) then delete @_listeningTo[id]
  @

metaMerger = exports.metaMerger = {}

metaMerger.iterative = (options, attrName) -->
  (classes) ->
    { right = false, check, join, postJoin } = options
    if right then iterF = _.reduceRight else iterF = _.reduce
      
    joinedAttribute = iterF classes, ((joined, cls) ->
      attr = cls[attrName]
      if not check or check attr
        if joined then join(joined, attr) else attr
      else joined), void

    if joinedAttribute
      ret = {}
      ret[attrName] = joinedAttribute   
      # postprocessing?
      if postJoin then postJoin ret, attrName, options
      else ret
      
    else void


metaMerger.mergeAttributeLeft = metaMerger.mergeAttribute = metaMerger.iterative

metaMerger.chainF = metaMerger.mergeAttribute check: ((f) -> f?@@ is Function), join: ((f1, f2) -> -> f2(...); f1(...))  
metaMerger.chainFRight = metaMerger.mergeAttribute right: true, check: ((f) -> f?@@ is Function), join: ((f1, f2) -> -> f2(...); f1(...))  

metaMerger.pipeF = metaMerger.mergeAttribute right: true, check: ((f) -> f?@@ is Function), join: ((f1, f2) -> f2 << f1)  
metaMerger.pipeFRight = metaMerger.mergeAttribute right: true, check: ((f) -> f?@@ is Function), join: ((f1, f2) -> f1 << f2)  


metaMerger.mergeDict = metaMerger.mergeAttribute right: true, check: ((d) -> d?@@ is Object), join: (d1, d2) -> _.extend {}, d1, d2
metaMerger.mergeDictDeep = metaMerger.mergeAttribute right: true, check: ((d) -> d?@@ is Object), join: (d1, d2) -> h.extend d1, d2

merger = exports.merger = {}

merger.initialize = metaMerger.chainF 'initialize'
merger.defaults = metaMerger.mergeDict 'defaults'
merger.deepDefaults = metaMerger.mergeDictDeep 'defaults'
merger.stringifyParse = metaMerger.pipeFRight 'stringifyParse'

Backbone.Model.mergers = [ merger.initialize, merger.defaults, merger.stringifyParse ]
Backbone.View.mergers = [ merger.initialize ]


