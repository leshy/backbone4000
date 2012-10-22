var Backbone = require('./index')


exports.when = function (test) {
    var X = Backbone.Model.extend4000({
        initialize: function () {
            this.when('something',function (value) { this.set({'somethingelse': value + 3}) }.bind(this) )
        }
    })

    var a = new X()
    a.set({something: 3})
    test.equals(a.get('somethingelse'), 6)
    
    var b = new X({something: 4})
    test.equals(b.get('somethingelse'), 7)
    
    test.done()
}
