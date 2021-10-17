 
var mongoose=require('mongoose');
 const { Schema } = mongoose;
 const userSchema = new Schema({
    username: {type:String,required:true},
  	password: {type:String,required:true}
  });

const User = mongoose.model('User', userSchema);

 const tokenSchema = new Schema({
    user: {type:String,required:true},
  	token: {type:String,required:true}
  });

const Token = mongoose.model('Token', tokenSchema);


///////////////////////////////////////////////////
 const PostSchema = new Schema({
    user: {type:String,required:true},
  	post_content: {type:String},
  	upvotes:{type:Number,default:0},
  	downvotes:{type:Number,default:0}

  });

const Post = mongoose.model('Post', PostSchema);


///////////////////////////////////////////////////
 const CommentSchema = new Schema({
    user: {type:String,required:true},
  	comment_content: {type:String},
  	post: {type:String,required:true},
  	upvotes:{type:Number,default:0},
  	downvotes:{type:Number,default:0}


  });

const Comment = mongoose.model('Comment', CommentSchema);


///////////////////////////////////////////////////
 const UpvoteSchema = new Schema({
    user: {type:String,required:true},
  	post: {type:String,required:true},

  });

const Upvote = mongoose.model('Upvote', UpvoteSchema);

///////////////////////////////////////////////////
 const DownvoteSchema = new Schema({
    user: {type:String,required:true},
  	post: {type:String,required:true},

  });

const Downvote = mongoose.model('Downvote', DownvoteSchema);
/////////////////////////////////////////////////////



///////////////////////////////////////////////////
 const CommentUpvoteSchema = new Schema({
    user: {type:String,required:true},
    comment: {type:String,required:true},

  });

const CommentUpvote = mongoose.model('CommentUpvote', CommentUpvoteSchema);

///////////////////////////////////////////////////
 const CommentDownvoteSchema = new Schema({
    user: {type:String,required:true},
    comment: {type:String,required:true},

  });

const CommentDownvote = mongoose.model('CommentDownvote', CommentDownvoteSchema);
/////////////////////////////////////////////////////

module.exports = { User,Token,Post,Comment,Upvote,Downvote,CommentUpvote,CommentDownvote};
