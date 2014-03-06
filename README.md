### some small backbone features I miss


.extend4000 - multiple inheritance aditions, automatically calls initialize on superclasses, and defaults object is _.extend ed from superclasses instead of just rewritten

example:
`
Backbone.Model.extend4000(some_other_model, { defaults: { bla: 3 } }, some_other_model2, {defaults: { x: 1 }, initialize: function() { return })
`
will create a model inheriting from all four models, initialize functions and defaults objects will be merged


.when (attribute,callback) - run callback if attribute exists or when the attribute first gets set, useful for models that 'activate' when they get all the properties, which are unavailiable when initializing

subscribe calls return unsubscribe functions

.onOnce - bind for an event and automatically unbind upon the first trigger (implemented by backbone now, as .once)

.listenToOnce - same as onOnce

.singleton - create a class and immediately instantiate it

._super(methodname, arguments...) - call a method from a superclass


