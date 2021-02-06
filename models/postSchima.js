const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    username: {
        type: String,
        // required: true,
        // min: 6,
        // max: 255
    },
    title: {
      type: String,
    //   required: true,
    //   min: 6,
    //   max: 555
  },
     content: {
      type: String,
    //   required: true,
    //   min: 6,
    //   max: 2000
  },

});


// const postSchema = {
//     title: String,
//     content: String
// };


const Post = mongoose.model('Post',postSchema);

module.exports = Post;