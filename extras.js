(function(){
  var _, Backbone, OrderedDict, ChildCollection, CollectionCollection, Tagged, AttrTagged, slice$ = [].slice;
  _ = require('underscore');
  import$(exports, Backbone = require('./index'));
  OrderedDict = exports.OrderedDict = Backbone.Model.extend4000({
    constructor: function(){
      var initValues;
      initValues = slice$.call(arguments);
      return Backbone.Model.apply(this, [void 8].concat(initValues));
    },
    initialize: function(arg$){
      var initValues, this$ = this;
      initValues = slice$.call(arguments, 1);
      this.order = [];
      this.on('change', function(model){
        var this$ = this;
        return _.map(model.changed, function(value, key){
          if (!model._previousAttributes[key]) {
            return this$.order.push(key);
          }
        });
      });
      return _.map(initValues, function(it){
        return this$.set(it);
      });
    },
    map: function(cb){
      var this$ = this;
      return _.map(this.order, function(key){
        return cb(this$.get(key), key);
      });
    }
  });
  ChildCollection = Backbone.Model.extend4000({
    initialize: function(id){
      var this$ = this;
      this.cid = this.id = id;
      this.c = new Backbone.Collection();
      return this.c.on('all', function(){
        return this$.trigger.apply(this$, arguments);
      });
    },
    add: function(){
      var args;
      args = slice$.call(arguments);
      return this.c.add.apply(this.c, args);
    },
    remove: function(){
      var args;
      args = slice$.call(arguments);
      return this.c.remove.apply(this.c, args);
    }
  });
  CollectionCollection = exports.CollectionCollection = Backbone.Collection.extend({
    totalLength: 0,
    add: function(index){
      var models, collection, this$ = this;
      models = slice$.call(arguments, 1);
      if (!(collection = this.get(index))) {
        Backbone.Collection.prototype.add.call(this, collection = new ChildCollection(index));
        this.listenTo(collection, 'add', function(model){
          this$.totalLength++;
          this$.trigger('childAdd', model, collection);
          return this$.trigger('change', 'add', model, collection);
        });
        this.listenTo(collection, 'remove', function(model){
          this$.totalLength--;
          this$.trigger('childRemove', model, collection);
          return this$.trigger('change', 'remove', model, collection);
        });
      }
      return collection.add(models);
    },
    remove: function(index){
      var models, collection;
      models = slice$.call(arguments, 1);
      if (!(collection = this.get(index))) {
        throw new Error("no collection at " + index);
      }
      collection.remove(models);
      if (!collection.length) {
        Backbone.Collection.prototype.remove.call(this, collection, {
          silent: true
        });
        this.stopListening(collection);
        return this.trigger('remove', collection);
      }
    }
  });
  Tagged = exports.Tagged = Backbone.Model.extend4000({
    forktags: function(){
      if (this.constructor.prototype.tags === this.tags) {
        if (this.tags) {
          return this.tags = _.extend({}, this.tags);
        } else {
          return this.tags = {};
        }
      }
    },
    delTag: function(tag){
      var data;
      this.forktags();
      data = this.tags[tag];
      delete this.tags[tag];
      this.trigger('changeTag', 'del', tag, data);
      this.trigger('delTag', tag, data);
      return this.trigger('delTag:' + tag, data);
    },
    addTag: function(tag, data){
      data == null && (data = true);
      if (this.hasTag[tag]) {
        return;
      }
      this.forktags();
      this.tags[tag] = data;
      this.trigger('changeTag', 'add', tag, data);
      this.trigger('addTag', tag, data);
      return this.trigger('addTag:' + tag, data);
    },
    changeTags: function(){
      var tags;
      tags = slice$.call(arguments);
      this.forktags();
      tags = _.flatten(tags);
      throw Error('unimplemented');
    },
    addTags: function(){
      var tags, this$ = this;
      tags = slice$.call(arguments);
      tags = _.flatten(tags);
      return _.each(tags, function(it){
        return this$.addTag(it);
      });
    },
    delTags: function(){
      var tags, this$ = this;
      tags = slice$.call(arguments);
      tags = _.flatten(tags);
      return _.each(tags, function(it){
        return this$.delTag(it);
      });
    },
    hasTag: function(){
      var tags, this$ = this;
      tags = slice$.call(arguments);
      tags = _.flatten(tags);
      return !_.find(tags, function(tag){
        var ref$;
        return !((ref$ = this$.tags) != null && ref$[tag]);
      });
    },
    hasTagOr: function(){
      var tags;
      tags = slice$.call(arguments);
      return _.find(_.keys(this.tags), function(tag){
        return in$(tag, tags);
      });
    }
  });
  AttrTagged = exports.AttrTagged = Tagged.extend4000({
    forktags: function(){
      this.tags = this.get('tags');
      if (!this.tags) {
        this.set({
          tags: this.tags = {}
        });
      }
      if (this.touch) {
        return this.touch('tags');
      }
    }
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL25vZGVsaWJzL2JhY2tib25lNDAwMC9leHRyYXMubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFDdUIsQ0FBWixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQTtVQUVYLFNBQVksUUFBUyxDQUFBLENBQUEsQ0FBRSxRQUFRLFNBQUE7RUFLL0IsV0FBWSxDQUFBLENBQUEsQ0FBRSxPQUFPLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBRSxRQUFRLENBQUMsS0FBSyxDQUFDLFdBR2pEO0lBQUEsYUFBYSxRQUFBLENBQUE7O01BQUk7YUFBZSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sTUFBRyxDQUFFLE1BQUYsQ0FBUSxDQUFDLE9BQU8sVUFBQSxDQUFuQjs7SUFFckQsWUFBWSxRQUFBLENBQUEsSUFBQTs7TUFBVTtNQUNwQixJQUFDLENBQUEsS0FBTSxDQUFBLENBQUEsQ0FBRTtNQUVULElBQUMsQ0FBQSxHQUFHLFVBQVUsUUFBQSxDQUFBLEtBQUE7O2VBQ1osQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLFNBQVMsUUFBQSxDQUFBLEtBQUEsRUFBQSxHQUFBO1VBQ25CLElBQUcsQ0FBSSxLQUFLLENBQUMsbUJBQW1CLENBQUMsR0FBRCxDQUFoQzttQkFBMkMsS0FBQyxDQUFBLEtBQUssQ0FBQyxLQUFLLEdBQUE7O1NBRG5EO09BREo7YUFJSixDQUFDLENBQUMsSUFBSSxZQUFZLFFBQUEsQ0FBQSxFQUFBO2VBQUcsS0FBQyxDQUFBLElBQUksRUFBQTtPQUFwQjs7SUFFUixLQUFLLFFBQUEsQ0FBQSxFQUFBOzthQUFRLENBQUMsQ0FBQyxJQUFJLElBQUMsQ0FBQSxPQUFPLFFBQUEsQ0FBQSxHQUFBO2VBQVMsR0FBRyxLQUFDLENBQUEsSUFBSSxHQUFELEdBQU8sR0FBWDtPQUFwQjs7RUFYbkIsQ0FBQTtFQWlCRixlQUFnQixDQUFBLENBQUEsQ0FBRSxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQy9CO0lBQUEsWUFBWSxR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OztNQUFJO01BQ1osSUFBRyxDQUFJLElBQUMsQ0FBQSxJQUFSO1FBQWtCLElBQUMsQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFFLElBQUMsQ0FBQSxJQUFJLE1BQUE7O2FBQy9CLE1BQU0sQ0FBQSxTQUFFLENBQUEsUUFBUSxDQUFDLE1BQU0sTUFBRyxJQUFIOztFQVh6QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiIyBhdXRvY29tcGlsZVxucmVxdWlyZSEgeyB1bmRlcnNjb3JlOiBfIH1cblxuZXhwb3J0cyA8PDwgQmFja2JvbmUgPSByZXF1aXJlICcuL2luZGV4J1xuXG4jXG4jIHdhaXQsIHRoaXMgY291bGQgYmUgcmVwbGFjZXMgYnkgdGhlIHZhbmlsbGEgYmFja2JvbmUgY29sbGVjdGlvbj8gaXQgc3VwcG9ydHMgc29ydGluZ1xuIyBcbk9yZGVyZWREaWN0ID0gZXhwb3J0cy5PcmRlcmVkRGljdCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZDQwMDAgZG9cblxuICAjIGF2b2lkIGJiIG1vZGVsIGluaXQgYXR0cmlidXRlIHNldHRpbmdcbiAgY29uc3RydWN0b3I6ICguLi5pbml0VmFsdWVzKSAtPiBCYWNrYm9uZS5Nb2RlbC5hcHBseSBALCBbIHZvaWQgXS5jb25jYXQgaW5pdFZhbHVlc1xuXG4gIGluaXRpYWxpemU6ICh2b2lkLCAuLi5pbml0VmFsdWVzKSAtPlxuICAgIEBvcmRlciA9IFtdXG4gICAgXG4gICAgQG9uICdjaGFuZ2UnLCAobW9kZWwpIC0+XG4gICAgICBfLm1hcCBtb2RlbC5jaGFuZ2VkLCAodmFsdWUsIGtleSkgfj4gXG4gICAgICAgIGlmIG5vdCBtb2RlbC5fcHJldmlvdXNBdHRyaWJ1dGVzW2tleV0gdGhlbiBAb3JkZXIucHVzaCBrZXlcblxuICAgIF8ubWFwIGluaXRWYWx1ZXMsIH4+IEBzZXQgaXRcbiAgICAgIFxuICBtYXA6IChjYikgLT4gXy5tYXAgQG9yZGVyLCAoa2V5KSB+PiBjYiBAZ2V0KGtleSksIGtleVxuXG4jXG4jIGNvbGxlY3Rpb24gdGhhdCBob2xkcyBvdGhlciBjb2xsZWN0aW9ucy4gdGhpcyBpcyBzbyBkdW1iLCBzaG91bGQgYmUgc3VwcG9ydGVkIGJ5IGRlZmF1bHQgdG8gYXJiaXRyYXJ5IGRlcHRoXG4jIHNob3VsZCBwbGF5IHdpdGggYmFja2JvbmUubW9kZWwgdGhhdCBpbmhlcml0cyBmcm9tIHRoZSBjb2xsZWN0aW9uIHRvIGFjaGlldmUgdGhpc1xuIyBcbkNoaWxkQ29sbGVjdGlvbiA9IEJhY2tib25lLk1vZGVsLmV4dGVuZDQwMDAgZG9cbiAgaW5pdGlhbGl6ZTogKGlkKSAtPlxuICAgIEBjaWQgPSBAaWQgPSBpZFxuICAgIEBjID0gbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKVxuICAgIEBjLm9uICdhbGwnLCB+PiBAdHJpZ2dlciAuLi5cbiAgXG4gIGFkZDogKC4uLmFyZ3MpIC0+IEBjLmFkZC5hcHBseSBAYywgYXJnc1xuICByZW1vdmU6ICguLi5hcmdzKSAtPiBAYy5yZW1vdmUuYXBwbHkgQGMsIGFyZ3NcbiAgXG5Db2xsZWN0aW9uQ29sbGVjdGlvbiA9IGV4cG9ydHMuQ29sbGVjdGlvbkNvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCBkb1xuICB0b3RhbExlbmd0aDogMFxuICBcbiAgYWRkOiAoaW5kZXgsIC4uLm1vZGVscykgLT5cbiAgICBpZiBub3QgY29sbGVjdGlvbiA9IEBnZXQoaW5kZXgpXG4gICAgICBCYWNrYm9uZS5Db2xsZWN0aW9uOjphZGQuY2FsbCBALCBjb2xsZWN0aW9uID0gbmV3IENoaWxkQ29sbGVjdGlvbihpbmRleClcbiAgICAgIEBsaXN0ZW5UbyBjb2xsZWN0aW9uLCAnYWRkJywgKG1vZGVsKSB+PlxuICAgICAgICBAdG90YWxMZW5ndGgrK1xuICAgICAgICBAdHJpZ2dlciAnY2hpbGRBZGQnLCBtb2RlbCwgY29sbGVjdGlvblxuICAgICAgICBAdHJpZ2dlciAnY2hhbmdlJywgJ2FkZCcsIG1vZGVsLCBjb2xsZWN0aW9uXG4gICAgICAgIFxuICAgICAgQGxpc3RlblRvIGNvbGxlY3Rpb24sICdyZW1vdmUnLCAobW9kZWwpIH4+XG4gICAgICAgIEB0b3RhbExlbmd0aC0tXG4gICAgICAgIEB0cmlnZ2VyICdjaGlsZFJlbW92ZScsIG1vZGVsLCBjb2xsZWN0aW9uXG4gICAgICAgIEB0cmlnZ2VyICdjaGFuZ2UnLCAncmVtb3ZlJywgbW9kZWwsIGNvbGxlY3Rpb25cbiAgICAgIFxuICAgIGNvbGxlY3Rpb24uYWRkIG1vZGVsc1xuXG4gIHJlbW92ZTogKGluZGV4LCAuLi5tb2RlbHMpIC0+XG4gICAgaWYgbm90IGNvbGxlY3Rpb24gPSBAZ2V0KGluZGV4KSB0aGVuIHRocm93IG5ldyBFcnJvciBcIm5vIGNvbGxlY3Rpb24gYXQgI3tpbmRleH1cIlxuICAgIGNvbGxlY3Rpb24ucmVtb3ZlIG1vZGVsc1xuICAgIFxuICAgIGlmIG5vdCBjb2xsZWN0aW9uLmxlbmd0aFxuICAgICAgQmFja2JvbmUuQ29sbGVjdGlvbjo6cmVtb3ZlLmNhbGwgQCwgY29sbGVjdGlvbiwgc2lsZW50OiB0cnVlXG4gICAgICBAc3RvcExpc3RlbmluZyBjb2xsZWN0aW9uXG4gICAgICBAdHJpZ2dlciAncmVtb3ZlJywgY29sbGVjdGlvblxuXG5cbiMgaGFzVGFnKHRhZ3MuLi4pXG4jIGhhc1RhZ09yKHRhZ3MuLi4pXG4jIGFkZHRhZyh0YWdzLi4uKVxuIyBkZWx0YWcodGFncy4uLilcblRhZ2dlZCA9IGV4cG9ydHMuVGFnZ2VkID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kNDAwMCBkb1xuICAgICMgd2lsbCBjcmVhdGUgYSBuZXcgdGFncyBvYmplY3QgZm9yIHRoaXMgcGFydGljdWxhciBzdGF0ZSBpbnN0YW5jZS5cbiAgICBmb3JrdGFnczogLT5cbiAgICAgIGlmIEBjb25zdHJ1Y3Rvcjo6dGFncyBpcyBAdGFnc1xuICAgICAgICBpZiBAdGFncyB0aGVuIEB0YWdzID0gXy5leHRlbmQge30sIEB0YWdzIGVsc2UgQHRhZ3MgPSB7fVxuXG4gICAgZGVsVGFnOiAodGFnKSAtPlxuICAgICAgICBAZm9ya3RhZ3MoKVxuICAgICAgICBkYXRhID0gQHRhZ3NbdGFnXVxuICAgICAgICBkZWxldGUgQHRhZ3NbdGFnXVxuICAgICAgICBAdHJpZ2dlciAnY2hhbmdlVGFnJywgJ2RlbCcsIHRhZywgZGF0YVxuICAgICAgICBAdHJpZ2dlciAnZGVsVGFnJywgdGFnLCBkYXRhXG4gICAgICAgIEB0cmlnZ2VyICdkZWxUYWc6JyArIHRhZywgZGF0YVxuXG4gICAgYWRkVGFnOiAodGFnLCBkYXRhID0gdHJ1ZSkgLT5cbiAgICAgICAgaWYgQGhhc1RhZ1t0YWddIHRoZW4gcmV0dXJuXG4gICAgICAgIEBmb3JrdGFncygpXG4gICAgICAgIEB0YWdzW3RhZ10gPSBkYXRhXG4gICAgICAgIEB0cmlnZ2VyICdjaGFuZ2VUYWcnLCAnYWRkJywgdGFnLCBkYXRhXG4gICAgICAgIEB0cmlnZ2VyICdhZGRUYWcnLCB0YWcsIGRhdGFcbiAgICAgICAgQHRyaWdnZXIgJ2FkZFRhZzonICsgdGFnLCBkYXRhXG5cbiAgICBjaGFuZ2VUYWdzOiAoLi4udGFncykgLT5cbiAgICAgIEBmb3JrdGFncygpXG4gICAgICB0YWdzID0gXy5mbGF0dGVuIHRhZ3NcbiAgICAgIC4uLlxuICAgICAgXG4gICAgYWRkVGFnczogKC4uLnRhZ3MpIC0+XG4gICAgICB0YWdzID0gXy5mbGF0dGVuIHRhZ3NcbiAgICAgIF8uZWFjaCB0YWdzLCB+PiBAYWRkVGFnIGl0XG4gICAgICBcbiAgICBkZWxUYWdzOiAoLi4udGFncykgLT5cbiAgICAgIHRhZ3MgPSBfLmZsYXR0ZW4gdGFnc1xuICAgICAgXy5lYWNoIHRhZ3MsIH4+IEBkZWxUYWcgaXRcblxuICAgIGhhc1RhZzogKC4uLnRhZ3MpIC0+XG4gICAgICB0YWdzID0gXy5mbGF0dGVuIHRhZ3NcbiAgICAgIG5vdCBfLmZpbmQodGFncywgKHRhZykgfj4gbm90IEB0YWdzP1t0YWddKVxuXG4gICAgaGFzVGFnT3I6ICguLi50YWdzKSAtPiBfLmZpbmQgXy5rZXlzKEB0YWdzKSwgKHRhZykgLT4gdGFnIGluIHRhZ3NcblxuIyBsaWtlIHRhZ2dlZCBidXQga2VlcHMgaXRzIHRhZ3MgaW4gQGF0dHJpYnV0ZXNcbkF0dHJUYWdnZWQgPSBleHBvcnRzLkF0dHJUYWdnZWQgPSBUYWdnZWQuZXh0ZW5kNDAwMCBkb1xuICBmb3JrdGFnczogLT5cbiAgICBAdGFncyA9IEBnZXQgJ3RhZ3MnXG4gICAgaWYgbm90IEB0YWdzIHRoZW4gQHNldCB0YWdzOiBAdGFncyA9IHt9XG4gICAgaWYgQHRvdWNoIHRoZW4gQHRvdWNoICd0YWdzJyAjIGZvciByZW1vdGVtb2RlbCwgcmVnaXN0ZXIgdGhlIGNoYW5nZVxuXG4gIGhhc1RhZzogKC4uLmFyZ3MpIC0+XG4gICAgaWYgbm90IEB0YWdzIHRoZW4gQHRhZ3MgPSBAZ2V0ICd0YWdzJ1xuICAgIFRhZ2dlZDo6aGFzVGFnLmFwcGx5IEAsIGFyZ3NcbiAgICBcbiAgaGFzVGFnT3I6ICguLi5hcmdzKSAtPlxuICAgIGlmIG5vdCBAdGFncyB0aGVuIEB0YWdzID0gQGdldCAndGFncydcbiAgICBUYWdnZWQ6Omhhc1RhZ09yLmFwcGx5IEAsIGFyZ3NcbiJdfQ==
