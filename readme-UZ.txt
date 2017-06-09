1)install npm globally (c folder)
2)create folder in any directory and get into folder using cmd
3)npm init (will create package.json)
4)npm install express body-parser ejs mongoose --save
5)create server.js file


=================================================

1) npm server
2) npm start
3) npm install -g nodemon (this will make your server listen, you don't need to stop N start server again N again)
4) nodemon (means node monitor)

=================================================

Mongoose:

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/your-db-name');

var schema = mongoose.Schema();
var collectionSchema = new schema({
	title: String,
	age:   Number,
	ect...
});

var collectionModel = mongoose.model('Collection-Name-here', collectionSchema);

=================================================

Express Session

npm install --save express-session

register it into server.js file (main file of your project)

var session = require('express-session');

app.use(session({secret: "anything-write-here-and-should-be-complex", resave: false: saveUninitialized: true}));

=================================================

JWT (JSON Web Token)

npm install --save jwt-express

var jwt = require('jwt-express');

app.use(jwt.init('secret'));

=================================================

run mongod instance first

c->programfile->mongoDB->....