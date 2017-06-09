var express = require('express');
var app = express();
var router = express.Router();
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file
app.set('superSecret', config.secret); // secret variable
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/local');

/** Declare variables */
/** Declare variables */

var Schema = mongoose.Schema;
var taskDataSchema = new Schema({
    username: String,
    password: String,
    email: String
}, {
        autoIndex: false
    });

var taskModel = mongoose.model('tasks', taskDataSchema);/*creating model to intantiate (collection, new Schema)*/

/**Register New User */
router.post('/registerUser', function (req, res, next) {
    var body = req.body;
    taskModel.findOne({ email: body.email }, function (err, doc) {
        if (err) {
            var object = {
                'message': 'error',
            };
            return res.json(object);
        }
        if (!doc) {
            var _newUser = new taskModel({
                username: body.username,
                email: body.email,
                password: body.password
            });
            _newUser.save(function (err, result) {
                if (result) {
                    // create a token
                    var token = jwt.sign(result, app.get('superSecret'), {
                        expiresIn: 60 // expires in 24 hours
                    });
                    var object = {
                        'message': 'User resgistered successfully',
                        'token': token
                    };
                    return res.json(object);
                } else if (err) {
                    var object = {
                        'message': 'something wrong :( with registration',
                    };
                    return res.json(object);
                }
            });
        } else {
            var object = {
                'message': 'user already exists',
            };
            return res.json(object);
        }
    });
});

/**Login User */
router.post('/login', function (req, res, next) {
    var body = req.body;
    taskModel.findOne({ username: body.username, password: body.password }, function (err, doc) {
        if (err) {
            return res.status({
                success: false,
                message: 'login error!'
            });
        }
        if (doc) {
            if (doc.password == body.password) {
                // create a token
                var token = jwt.sign(doc, app.get('superSecret'), {
                    expiresIn: 60 // expires in 24 hours
                });
                var object = {
                    'message': 'success',
                    'token': token
                }
                return res.json(object);
            } else {
                return res.status({
                    success: false,
                    message: 'User password is not correct!'
                });
            }
        } else {
            return res.status({
                success: false,
                message: 'User not exist!'
            });
        }
    });
});

// route middleware to verify a token
router.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.',
        });
    }
});

router.post('/tasks', function (req, res, next) {
    taskModel.find(function (err, doc) {
        res.json(doc);
    });
});

router.get('/task/:id', function (req, res, next) {
    var parameter = req.params.id;
    taskModel.findById({ _id: parameter }, function (err, doc) {
        res.json(doc);
    });
});

// //Get All tasks
// router.get('/tasks', function (req, res, next) {
//     db.tasks.find(function (err, tasks) {
//         if (err) {
//             res.send(err);
//         }
//         res.json(tasks);
//     });
// });


// //Get Single Task
// router.get('/task/:id', function (req, res, next) {
//     db.tasks.findOne({ _id: mongojs.ObjectId(req.params.id) }, function (err, task) {
//         if (err) {
//             res.send(err);
//         }
//         res.json(task);
//     });
// });

// //Save task
// router.post('/task', function (req, res, next) {
//     var task = req.body;
//     if (!task.title || !(task.isDone + '')) {
//         res.status(400);
//         res.json({
//             "error": "Bad Data POST",
//             "title": task.title,
//             "isDone": task.isDone
//         });
//     } else {
//         db.tasks.save(task, function (err, task) {
//             if (err) {
//                 res.send(err);
//             }
//             res.json(task);
//         });
//     }
// });

// //Delete Task
// router.delete('/task/:id', function (req, res, next) {
//     db.tasks.remove({ _id: mongojs.ObjectId(req.params.id) }, function (err, task) {
//         if (err) {
//             res.send(err);
//         }
//         res.json(task);
//     });
// });

// //update Task
// router.put('/task/:id', function (req, res, next) {
//     var task = req.body;
//     var updateTask = {};

//     if (task.isDone) {
//         updateTask.isDone = task.isDone;
//     }
//     if (task.title) {
//         updateTask.title = task.title;
//     }
//     if (!updateTask) {
//         res.status(400);
//         res.json({
//             "error": "Bad Data"
//         });
//     } else {
//         db.tasks.update({ _id: mongojs.ObjectId(req.params.id) }, updateTask, {}, function (err, task) {
//             if (err) {
//                 res.send(err);
//             }
//             res.json(task);
//         });
//     }

// });

module.exports = router;