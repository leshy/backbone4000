// Generated by LiveScript 1.4.0
(function(){
  var Backbone, util, colors, h, _, slice$ = [].slice;
  Backbone = require('./extras');
  util = require('util');
  colors = require('colors');
  h = require('helpers');
  _ = require('underscore');
  exports.basicExtend = function(test){
    var res, A, a;
    res = {};
    A = Backbone.Model.extend4000({
      initialize: function(){
        return res.a1 = 1;
      }
    }, {
      initialize: function(){
        return res.a2 = 2;
      }
    }, {
      bla: 666
    });
    a = new A();
    test.deepEqual(res, {
      a1: 1,
      a2: 2
    });
    test.equals(a.bla, 666);
    return test.done();
  };
  exports.metaClass = function(test){
    var res, A, a;
    res = {};
    A = Backbone.Model.extend4000({
      initialize: function(){
        return res.a1 = 1;
      }
    }, {
      initialize: function(){
        return res.a2 = 2;
      }
    }, {
      bla: 666
    }, {
      transformers: function(cls){
        cls.prototype.bla *= 2;
        return cls;
      }
    });
    a = new A();
    test.deepEqual(res, {
      a1: 1,
      a2: 2
    });
    test.equals(a.bla, 1332);
    return test.done();
  };
  exports.inherit = function(test){
    var res, A, B, b;
    res = {};
    A = Backbone.Model.extend4000({
      initialize: function(){
        return res.a1 = 1;
      }
    });
    B = A.extend4000({
      initialize: function(){
        return res.a2 = 2;
      }
    });
    b = new B();
    test.deepEqual(res, {
      a1: 1,
      a2: 2
    });
    return test.done();
  };
  exports.properSuperAndSuch = function(test){
    var res, A, B, C, c;
    res = {};
    A = Backbone.Model.extend4000({
      initialize: function(it){
        res.a1 = it;
        return res.a1bla = this.bla;
      },
      testf: function(it){
        return res.ta1 = it;
      }
    }, {
      initialize: function(it){
        res.a2 = it;
        return res.a2bla = this.bla;
      },
      testf: function(it){
        return res.ta2 = it;
      }
    });
    B = Backbone.Model.extend4000({
      initialize: function(it){
        return res.b1 = it;
      },
      testf: function(it){
        res.tb = it;
        return this._super('testf', 'supercall');
      }
    });
    C = A.extend4000(B, {
      initialize: function(it){
        return res.c1 = it;
      },
      bla: 1
    });
    c = new C({
      bla: 2
    });
    c.testf('hi there');
    console.log(util.inspect(res, {
      colors: true
    }));
    test.deepEqual(res, {
      c1: {
        bla: 2
      },
      b1: {
        bla: 2
      },
      a1: {
        bla: 2
      },
      a1bla: 1,
      a2: {
        bla: 2
      },
      a2bla: 1,
      tb: 'hi there',
      ta2: 'supercall'
    });
    return test.done();
  };
  exports.collectionCollection = function(test){
    var a, events, event, testModel1, testModel2, testModel3;
    a = new Backbone.CollectionCollection();
    events = {};
    event = function(name){
      var data;
      data = slice$.call(arguments, 1);
      h.dictpush(events, name, data);
      return console.log.apply(console, [colors.green(name)].concat(data));
    };
    a.on('some_model_event', function(){
      var args;
      args = slice$.call(arguments);
      return event('some_model_event', args);
    });
    a.on('childAdd', function(model, collection){
      return event('childAdd', collection.id, model.id);
    });
    a.on('childRemove', function(model, collection){
      return event('childRemove', collection.id, model.id);
    });
    a.on('change', function(){
      var args;
      args = slice$.call(arguments);
      return event('change', true);
    });
    a.on('add', function(cc){
      event('addCollection', cc.id);
      cc.on('add', function(model){
        return event('addModel', cc.id, model.id);
      });
      return cc.on('remove', function(model){
        return event('delModel', cc.id, model.id);
      });
    });
    a.on('remove', function(elem){
      test.equals(elem.id, 'blu');
      return event('removeCollection', elem.id);
    });
    a.add("bla", testModel1 = new Backbone.Model({
      id: 'testmodel1',
      bla: 3
    }));
    a.add("bla", testModel2 = new Backbone.Model({
      id: 'testmodel2',
      bla: 4
    }));
    a.add("blu", testModel3 = new Backbone.Model({
      id: 'testmodel3',
      blu: 1
    }));
    test.equals(a.totalLength, 3);
    testModel2.trigger("some_model_event", true, 3);
    a.remove("blu", testModel3);
    test.equals(a.totalLength, 2);
    test.deepEqual(events, {
      addCollection: [['bla'], ['blu']],
      addModel: [['bla', 'testmodel1'], ['bla', 'testmodel2'], ['blu', 'testmodel3']],
      childAdd: [['bla', 'testmodel1'], ['bla', 'testmodel2'], ['blu', 'testmodel3']],
      change: [[true], [true], [true], [true]],
      some_model_event: [[[true, 3]]],
      delModel: [['blu', 'testmodel3']],
      childRemove: [['blu', 'testmodel3']],
      removeCollection: [['blu']]
    });
    return test.done();
  };
}).call(this);
