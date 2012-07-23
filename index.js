var Backbone = require('backbone');

// converts retarded magical arguments object to an Array object
function toArray(arg) { return Array.prototype.slice.call(arg); }

// defaults attribute inheritance, and automatic super.initialize calls
(function () {
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

    Backbone.Model.extend4000 =
    Backbone.Collection.extend4000 =
    Backbone.Router.extendEach =
    Backbone.View.extend4000 = extend4000;

    function triggerOnce(event,f) {
        var self = this;
        this.bind(event,function() {
            self.unbind(event,f);
            f.apply(this,toArray(arguments));
        });
    }

    Backbone.Model.triggerOnce = triggerOnce;

})();


exports = Backbone.exports
