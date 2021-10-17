require('dotenv').config();
const bcrypt = require("bcrypt");
const express = require('express');
const cors = require('cors');
const app = express();
var dns=require('dns');
var URL = require("url").URL;
var bodyParser=require('body-parser');
app.set('view engine', 'ejs')
app.set('views','./views')

//mongo connect and import moddels
var mongoose=require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const { User,Token,Post,Comment,Upvote,Downvote,CommentUpvote,CommentDownvote} = require('./models.js');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


//endpoints start here

app.post('/api/registeruser',async function(req,res){


		if(req.body.username&&req.body.username!=""&&req.body.password&&req.body.password!=""){
			
			const salt = await bcrypt.genSalt(10);
    // now we set user password to hashed password
    		var hashed_pass= await bcrypt.hash(req.body.password, salt);

			const user=new User({username:req.body.username,password:hashed_pass});
		//saving stuff below

			User.findOne({username: (req.body.username)},function(err,data){
				if(data!=null){
					res.json({'Error':'Username already taken'})
				}
				else{
					user.save(function(err, data) {
					    if(err){
					      console.log(err);
					      res.json({"error":"not registered"})
					    }
					  	 res.json({'user':user.username,'created':true});
					});    
				}
			});

		}
		else{
			res.json({"Error":"One or more required paramters are missing or blank"})
		}
});

app.post('/api/retrievetoken',async function(req,res){
    User.findOne({username: (req.body.username)},async function(err,data){
    	if(data!=null){

    		const validPassword = await bcrypt.compare(req.body.password, data.password);
    		if(validPassword){
				const token=new Token({user:data.id,token:makeid(16)});
//saving stuff below
				token.save(function(err, data_saved) {
				    if(err){
				      console.log(err);
				    }
				   res.json({"access_token":data_saved.token});				  	 
				});    	
    		}
    		else{
    			res.json({'error':'Incorrect password'});
    		}
    	}
    	else{
    		res.json({'error':'User not found'});
    	}
  });
});


function auth(req,res,next){
	var authHeader = req.headers.authorization;
    if (authHeader) {
        var token = authHeader.split(' ')[1];    
		Token.findOne({token: (token)},function(err,data){
			if(data==null){
				res.json({"Error":"Invalid Access Token"});
			}
			else{
			    User.findById(data.user,function(err,user){
			    	if(user==null){
			    		res.json({'Error':"user no longer exists"});
			    	}
			    	else{
			   			//got resulting user
			   			req.user_id=user.id;
			   			req.username=user.username;
			   			next();
			    	}
			  	});
			}
		});
    }
    else{
    	res.json({'Error':"Missing Access Token"});
    }
}

app.post('/api/addpost',auth,function(req,res){

	const post=new Post({user:req.user_id,post_content:req.body.post_content});
//saving stuff below
	post.save(function(err, data) {
	    if(err){
	      res.json({"Error":"Post was not added successfully"})
	    }
		res.json({"status":"Successful","post_id":data.id,"content":data.post_content})
	});    
	  
});


app.post('/api/deletepost',auth,function(req,res){
	Post.find({user:req.user_id},function(err,data){
		    if(err){
		      return console.log(err);
		    }
		    else{
		    	var found=false;
				data.forEach(function(post){
					if(post.id==req.body.post_id){
						found=true;
					}
				})
				if(found){
					Post.findByIdAndRemove(req.body.post_id,function(err,post){
    						if(err){res.json({'err':err})}
							res.json({'status':"deleted",'post_id':post.id});    
					})

				}
				else{
					res.json({'Error':"The post could not be accessed"})
				}
		    }
	});

});






app.get('/api/posts/:username', function(req, res) {
    User.findOne({'username':req.params.username},function(err,user){
    	if(user==null){
    		res.json({'Error':"Cannot retrieve users posts"});
    	}
    	else{
   			//got resulting user
			Post.find({user:user.id},function(err,data){
		    if(err){
		      return console.log(err);
		    }
		    res.json({'username':user.username,'posts':data});
		  });

    	}

  	});
});


app.get('/api/post/:post_id',function(req,res){
	Post.findById(req.params.post_id,function(err,data){
	    if(err){
	      return console.log(err);
	    }
	    try{
			Comment.find({post:data.id},function(err,data_comments){
				if(err){
					return console.err;
				}
				res.json({'post':data,'comments':data_comments});
			});
		}
		catch(err){
			res.json({'err':"404 Post not found Some Issues were Encountered in getting this post"});
		}
	    
	  });
})



app.get('/api/posts',auth, function(req, res) {
			//got resulting user
	Post.find({user:req.user_id},function(err,data){
	    if(err){
	      return console.log(err);
	    }
	    res.json({'username':req.username,'posts':data});
	 });
});



app.get('/api/downvoted',auth, function(req, res) {

	Downvote.find({user:req.user_id},async function(err,data){
	    if(err){
	      return console.log(err);
	    }

	   	var postids=[];
	    for (var i = 0; i <data.length; i++) {
	    	postids.push(data[i].post)
	    }

	    Post.find({ _id:{$in:postids}},function(err,post_data){
		    if(err){
		      return console.log(err);
		    }
		    res.json({'posts':post_data});
	 	});

	 });

	////////////////////////////////////////////////////////
});


app.get('/api/upvoted',auth, function(req, res) {

	Upvote.find({user:req.user_id},async function(err,data){
	    if(err){
	      return console.log(err);
	    }
	    var postids=[];
	    for (var i = 0; i <data.length; i++) {
	    	postids.push(data[i].post)
	    }

	    Post.find({ _id:{$in:postids}},function(err,post_data){
		    if(err){
		      return console.log(err);
		    }
		    res.json({'posts':post_data});
	 	});

	    

	 });

});

function makeid(length) {
   var result           = '';
   var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}




app.post('/api/update/',function(req,res){

	if(req.body.newcontent&&req.body.newcontent!=""){
		Post.findById(req.body.post_id,function(err,post){

		    if(post!=null){
			    post.post_content=req.body.newcontent;
			    post.save(function(err,updatedpost){
			      if(err){return console.log(err)}
			       res.json({'id':post.id,'new_content':updatedpost.post_content})
			    })
			}
			else{
				res.json({"err":"the post you want to update either does not exist or does not belong to you."})
			}


		 })
	}
	else{
		res.json({"err":"no new content was added"});
	}
});



app.post('/api/:post_id/comment',auth,function(req,res){
	if(req.body.comment_content&&req.body.comment_content!=""){
		const comment=new Comment({user:req.user_id,comment_content:req.body.comment_content,post:req.params.post_id});
	//saving stuff below
		comment.save(function(err, data) {
		    if(err){
		      res.json({"Error":"Comment was not added successfully"})
		    }
			res.json({"status":"Successful","post_id":data.post,"comment_content":data.comment_content})
		}); 
	}
	else{
		res.json({"err":"no new comment was added"});
	}   
});

app.post('/api/:post_id/upvote',auth,function(req,res){

	const upvote=new Upvote({user:req.user_id,post:req.params.post_id});
//saving stuff below
	upvote.save(function(err, data) {
	    if(err){
	      res.json({"Error":"Upvote was not added successfully"})
	    }
		Post.findById(data.post,function(err,post){
	    	if(err){return console.log(err)}
	    	post.upvotes=post.upvotes+1;
	    	post.save(function(err,updatedpost){
	      		if(err){return console.log(err)}
	       		res.json({"status":"Successful","post_id":post.id,'upvote_id':data.id})
	    	})
	  	})

	});    
		  
});

app.post('/api/comment/:comment_id/upvote',auth,function(req,res){

	const commentupvote=new CommentUpvote({user:req.user_id,comment:req.params.comment_id});
//saving stuff below
	commentupvote.save(function(err, data) {
	    if(err){
	      res.json({"Error":"Upvote was not added successfully"})
	    }
		Comment.findById(data.comment,function(err,comment){
	    	if(err){return console.log(err)}
	    	comment.upvotes=comment.upvotes+1;
	    	comment.save(function(err,updatedcomment){
	      		if(err){return console.log(err)}
	       		res.json({"status":"Successful","comment_id":comment.id,'upvote_id':data.id})
	    	})
	  	})

	});    
		  
});



app.post('/api/comment/:comment_id/downvote',auth,function(req,res){

	const commentdownvote=new CommentDownvote({user:req.user_id,comment:req.params.comment_id});
//saving stuff below
	commentdownvote.save(function(err, data) {
	    if(err){
	      res.json({"Error":"Downvote was not added successfully"})
	    }
		Comment.findById(data.comment,function(err,comment){
	    	if(err){return console.log(err)}
	    	comment.downvotes=comment.downvotes+1;
	    	comment.save(function(err,updatedcomment){
	      		if(err){return console.log(err)}
	       		res.json({"status":"Successful","comment_id":comment.id,'downvote_id':data.id})
	    	})
	  	})

	});    
		  
});


app.post('/api/:post_id/downvote',auth,function(req,res){

	const downvote=new Downvote({user:req.user_id,post:req.params.post_id});
//saving stuff below
	downvote.save(function(err, data) {
	    if(err){
	      res.json({"Error":"Downvote was not added successfully"})
	    }

		Post.findById(data.post,function(err,post){
	    	if(err){return console.log(err)}
	    	post.downvotes=post.downvotes+1;
	    	post.save(function(err,updatedpost){
	      		if(err){return console.log(err)}
	       		res.json({"status":"Successful","post_id":post.id,'downvote_id':data.id})
	    	})
	  	})

	});    
		  
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

