var Backbone = require('backbone');
var _ = require('underscore');

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

Backbone.Model.extend4000 = Backbone.View.extend4000 = extend4000

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

// calls the callback once the attribute gets set, or calls it immediately if it already is.
function when (attribute,callback) {
    var attr
    if (attr = this.get(attribute)) { callback(attr) } 
    else { this.onOnce('change:' + attribute, function (model,attr) { callback(attr) }) }
}

patchBackbone(["Model"],"when",when)

// bind for an event, but trigger the callback only once
function onOnce(event,f) {
    var self = this;
    var bind = function() { self.unbind(event,f); f.apply(this,toArray(arguments)); }
    this.bind(event,bind);
    return bind
}

patchBackbone(["Model","View","Collection"],'onOnce',onOnce)





_.extend(exports, Backbone)
