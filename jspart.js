var Backbone = require('backbone');

var _ = require('underscore');

// make backbone views browserify compatible
if (global.$) { Backbone.$ = $ }

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
        if (!superc) { throw "FAIL NO SUPERC" }

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

// Backbone.Model.extend4000 = Backbone.View.extend4000 = Backbone.Collection.extend4000 = extend4000


function singleton () {
    newclass = this.extend4000.apply(this,arguments)
    return new newclass()
}

Backbone.Model.singleton = Backbone.View.singleton = singleton

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
        else { self.once('change:' + attribute, function (model,attr) { callback(attr) }) }
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

// return unsubscribe function upon subscription
function onOff(event,f) {
    var self = this;
    var bind = function() { f.apply(this,arguments) }
    this.on(event,bind);
    return function () { self.off(event,bind) }
}

patchBackbone(["Model","View","Collection"],'onOff',onOff)


// return unsubscribe function upon subscription
function onceOff(event,f) {
    var self = this;
    var bind = function() { f.apply(this,arguments) }
    this.once(event,bind);
    return function () { self.off(event,bind) }
}

patchBackbone(["Model","View","Collection"],'onceOff',onceOff)


// return unsubscribe function upon subscription
function listenToOnceOff(model,event,f) {
    var self = this;
    var bind = function() { f.apply(this,arguments) }
    this.listenToOnce(model,event,bind);
    return function () { self.stopListening(model,event,bind) }
}

patchBackbone(["Model","View","Collection"],'listenToOnceOff',listenToOnceOff)

// view remove executes view.cleanup if it exists and triggers remove event

var oldremove = Backbone.View.prototype.remove

Backbone.View.prototype.remove = function () {
    this.trigger('cleanup')
    if (this.cleanup) { this.cleanup() }
    oldremove.call(this)
}

_.extend(exports, Backbone)

// npm installs multiple backbones and preparemodel instanceof fails, this just removes the whole
// autoinstantiation that I don't really use.
exports.Collection.prototype._prepareModel = function(attrs) { return attrs }

// passive collection
// this is a collection that doesn't take any initialization arguments
// used when we want to extend a backbone model with a backbone collection
// and don't want the collection to try to add constructor arguments to itself
exports.PassiveCollection = PassiveCollection = function () {
    this._reset()
    this.initialize.apply(this, arguments);
}

PassiveCollection.prototype = _.extend({},Backbone.Collection.prototype)





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
//    console.log(methodName,args);

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
