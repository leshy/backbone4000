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



exports.Multiwhen = function (test) {
    var X = Backbone.Model.extend4000({
        initialize: function () {
            this.when('something1','something2',function (values) { this.set({'somethingelse': values.something1 + values.something2 + 3}) }.bind(this) )
        }
    })

    var a = new X()
    a.set({something1: 3})
    a.set({something2: 1})
    test.equals(a.get('somethingelse'), 7)
    
    var b = new X({something1: 4, something2: 2})
    test.equals(b.get('somethingelse'), 9)
    
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
    
    //console.log (z.constructor.__super__.x)
    //console.log( z.x() )
    
    
    test.done()
}
