var Backbone = require('backbone');
var _ = require('underscore');

/*
  just putting this here to remember.. backbone needs to be changed in order to be able to run jquery dependant views via browserify

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  try {
      window
      console.log("I'm running in a browser");
      Backbone.$ = require('jquery-browserify')
  } catch(err) {
      console.log("I'm not running in a browser"); 
  }

*/

// converts retarded magical arguments object to an Array object
function toArray(arg) { return Array.prototype.slice.call(arg); }

function patchBackbone (objects,methodname,f) {
    _.each(objects, function(Class) {
        Backbone[Class].prototype[methodname] = f
    });
}

// "defaults" attribute inheritance, and automatic super.initialize calls
function extend4000 () {
    var args = Array.prototype.slice.call(arguments),
    child = this;

    var initf = [];
    var defaults = {};
    if (child.prototype.defaults) {
        defaults = _.clone(child.prototype.defaults);
    }

    _.each(args, function (superc) {
        if (!superc) { console.log(args);throw "FAIL" }
        // did I receive a dictionary or an object/backbone model?
        if (superc.prototype) { superc = superc.prototype; }

        // inherit defaults
        if (superc.defaults) {
            defaults = _.extend(defaults,superc.defaults);
        }

        // build a list of initialize functions if you find more then one
        if (superc.initialize) {
            (initf.length) || initf.push(child.prototype.initialize);
            initf.push(superc.initialize);
        }

        child = child.extend(superc);
    });

    // construct a combined init function
    if (initf.length) {
        child = child.extend({ initialize : function(attributes,options) {
            var self = this;
            _.map(initf,function(initf) { initf.call(self,attributes,options); });
        }});
    }
    child.prototype.defaults = defaults;
    return child;
}

Backbone.Model.extend4000 = Backbone.View.extend4000 = Backbone.Collection.extend4000 = extend4000

function singleton () {
    newclass = this.extend4000.apply(this,arguments)
    return new newclass()
}

Backbone.Model.singleton = Backbone.View.singleton = singleton

// The super method takes two parameters: a method name
// and an array of arguments to pass to the overridden method.
// This is to optimize for the common case of passing 'arguments'.
function _super() {
    var args = toArray(arguments)
    var methodName = args.shift()

    // Keep track of how far up the prototype chain we have traversed,
    // in order to handle nested calls to _super.
    this._superCallObjects || (this._superCallObjects = {});
    var currentObject = this._superCallObjects[methodName] || this,
    parentObject  = findSuper(methodName, currentObject);
    this._superCallObjects[methodName] = parentObject;

    var result = parentObject[methodName].apply(this, args || []);
    delete this._superCallObjects[methodName];
    return result;
}

// Find the next object up the prototype chain that has a
// different implementation of the method.
function findSuper(methodName, childObject) {
    var object = childObject;
    while (object[methodName] === childObject[methodName]) {
        object = object.constructor.__super__;
    }
    return object;
}

patchBackbone(["Model", "Collection", "View", "Router"],'_super',_super)

// Calls the callback once the attribute gets set, or calls it immediately if it already is.
// I frequently use this when model needs some attributes to be set in order to do its job, 
// but would like the freedom to specify them post-init 
// (sometimes this is nessesary if two instances need each others references in order to function)
function when () {
    var self = this
    var attributes = toArray(arguments)
    var callback = attributes.pop()

    // This is commented to get speed while sacrificing safety
    // attributes = _.uniq(attributes) 

    function whenOne(attribute,callback) {
        if (attr = self.get(attribute)) { callback(attr) } 
        else { self.onOnce('change:' + attribute, function (model,attr) { callback(attr) }) }
    }

    if (attributes.length == 1) {
        whenOne(_.first(attributes),callback)
    } else {
        var res = {}
        
        // normally I'd use async here but would like to avoid a dependency.
        _.map(attributes, function (attr) {
            whenOne(attr,function (value) {
                res[attr] = value
                if (_.keys(res).length == attributes.length) callback(res)
            })
        })

    }
}

patchBackbone(["Model"],"when",when)

// bind for an event, but trigger the callback only once
function onOnce(event,f,context) {
    var self = this
    var unsubscribe = function() { self.off(event,f) }
    this.once(event,f,context) // backbone implemented this.. removing my implementation
    return unsubscribe
}

patchBackbone(["Model","View","Collection"],'onOnce',onOnce)

function listenToOnce (object,event,callback) {
    var self = this;
    var unsubscribe = function () { self.stopListening(object,event,bind) }
    var bind = function () {
        unsubscribe()
        callback.apply(this,arguments)
    }
    self.listenTo(object,event,bind)
    return unsubscribe
}

patchBackbone(["Model","View","Collection"],'listenToOnce',listenToOnce)

// return unsubscribe function upon subscription
function onOff(event,f) {
    var self = this;
    var bind = function() { f.apply(this,arguments) }
    this.on(event,bind);
    return function () { self.off(event,bind) } 
}

patchBackbone(["Model","View","Collection"],'onOff',onOff)

_.extend(exports, Backbone)


// passive collection
// this is a collection that doesn't take any initialization arguments
// used when we want to extend a backbone model with a backbone collection
// and don't want the collection to try to add constructor arguments to itself
exports.PassiveCollection = PassiveCollection = function () { 
    console.log('passive init')
    this._reset() 
    this.initialize.apply(this, arguments);
}

PassiveCollection.prototype = _.extend({},Backbone.Collection.prototype)

