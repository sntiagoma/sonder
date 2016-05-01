'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ShowSchema = new Schema({
  slug: {type: String, unique: true}
});

ShowSchema.methods = {
  getId : function () {
    return this.id;
  }
};

module.exports = mongoose.model('Show', ShowSchema);
