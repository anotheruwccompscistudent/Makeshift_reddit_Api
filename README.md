## How to run the api
It has been deployed at the url 
https://makeshiftreddit.herokuapp.com
All endpoints are demoed in the postman collection file

# API Documentation
---

POST  /api/registeruser 

(Allows user to register an account with a unique username and a password)

Payload/Data

username(required)

password(required)

All user passwords will be hashed with bcrypt

---

POST  /api/retrievetoken 

(Allows user to retrieve api key/token to make authenticated requests with)

Payload/Data
username(required)
password(required)

Reponse:access token

---

POST  /api/addpost 

(Allows user to add a post to their account)

Header

Authorization:Bearer <token>(required)

Payload/Data
  
post_content(required)
  
---
  
POST  /api/deletepost 
  
(Allows user to delete a post from their account)
  
Header
  
Authorization:Bearer <token>(required)

Payload/Data
  
post_id(required)
  
---
  
POST  /api/updatepost 
  
(Allows user to update a post from their account with new content)
  
Header
  
Authorization:Bearer <token>(required)

Payload/Data
  
post_id(required)
  
newcontent(required)
  
---
  
POST /api/<post id>/comment 
  
(Allows user to comment on a specific post)
  
payload/data
  
comment_content(required)
  
---
  
POST /api/comment/<comment_id>/(downvote|update)   
  
(Allows user to upvote/downvote a comment)
  
Header
  
Authorization:Bearer <token>(required)
  
---
  
POST /api/<post_id>/(downvote|upvote)    

(Allows user to upvote/downvote a post)
  
Header
  
Authorization:Bearer <token>(required)
  
---
  
GET  /api/post/<post id> 
  
(Allows user to view all the details of an individual post including its comments and also number of downvotes/upvotes)
  
---
  
GET  /api/posts/ 
  
(Allows user to view all the details of posts created under their account including its comments and also number of downvotes/upvotes)
  
Header
  
Authorization:Bearer <token>(required)
  
---
GET  /api/posts/<username> ( (Allows user to view all the details of an individual users posts including its comments and also number of downvotes/upvotes)





