'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MovieSchema = new Schema({
  slug: {type: String, unique: true}
});

MovieSchema.methods = {
  getId : function () {
    return this.id;
  }
};

module.exports = mongoose.model('Movie', MovieSchema);
