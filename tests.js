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


exports._super = function (test) {
    var X = Backbone.Model.extend4000({
        x: function () { return 'x'}
    })


    var Y = Backbone.Model.extend4000({
        y: function () { return 'y'} 
    })    

    var Z = Backbone.Model.extend4000( 
        X, Y, 
        {
            z: function () { return 'z'},
            x: function () { return this._super('x',[]) + "z"  }
        }
    )
    
    
    z = new Z()
    
    console.log (z.constructor.__super__.x)
    console.log( z.x() )
    
    
    test.done()
}
