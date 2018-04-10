//import libraries
var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var path = require('path');
var fs = require('fs')
var multer = require('multer');

//create neccessary objects
var app = express();
var router = express.Router();


//you need to update wp with your own database name
var db = monk('localhost:27017/wp');


//use objects in app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req,res,next){
    req.db = db;
    next();
});

//CLIENT SIDE ROUTING
app.set('views', __dirname+'/views');

app.get('/student_info', function(req, res){
	res.render('student_info.ejs');
});

app.get('/course_info', function(req, res){
	res.render('course_info.ejs');
});

app.get('/quiz_tool', function(req, res){
	res.render('quiz_tool.ejs');
});

app.get('/teaching_library', function(req, res){
	res.render('teaching_library.ejs');
});

app.get('/question_library', function(req, res){
	res.render('question_library.ejs');
});

router.get('/students', function(req, res, next) {
   console.log(req.method);
   next();

});

//SERVER SIDE ROUTING

///STUDENT_INFO.EJS
app.use('/', router);

router.get('/students', function(req, res) {
    req.db.collection('students').find({},{"limit": 100},function(e,docs){
        res.json(docs);
    });
});

router.get('/student/:id', function(req, res){
	req.db.collection('students').findById(req.params.id, function(e, doc){
		res.json(doc);
	})
});

router.put('/student/:id', function(req, res){
	req.db.collection('students').update({_id: req.params.id}, {name: req.body.name, yob: req.body.yob});
	req.db.collection('students').findById(req.params.id, function(e, doc){
		res.json(doc);
	})

});

router.delete('/student/:id', function(req, res){
	req.db.collection('students').remove({_id: req.params.id}, function(e, doc){
		res.json(doc);
	})
});

router.post('/students', function(req, res){

	console.log(req.body);
	req.db.collection('students').insert(req.body, function(e, docs){
		res.json(docs);
	});
});
///SEARCH STUDENTS
router.get('/student/search/:name', function(req, res){
	var query = {
	  name: {
	    $regex: '^'+req.params.name+'',
	    $options: 'i' //i: ignore case, m: multiline, etc
	  }
	};
	req.db.collection('students').find(query, function(e, doc){
		res.json(doc);
	})
});

///COURSE_INFO.EJS
app.use('/', router);

router.get('/courses', function(req, res) {
    req.db.collection('courses').find({},{"limit": 100},function(e,docs){
        res.json(docs);
    });
});

router.get('/course/:id', function(req, res){
	req.db.collection('courses').findById(req.params.id, function(e, doc){
		res.json(doc);
	})
});

router.put('/course/:id', function(req, res){
	req.db.collection('courses').update({_id: req.params.id}, {name: req.body.name, code: req.body.code});
	req.db.collection('courses').findById(req.params.id, function(e, doc){
		res.json(doc);
	})

});


router.delete('/course/:id', function(req, res){
	req.db.collection('courses').remove({_id: req.params.id}, function(e, doc){
		res.json(doc);
	})
});

router.post('/courses', function(req, res){

	console.log(req.body);
	req.db.collection('courses').insert(req.body, function(e, docs){
		res.json(docs);
	});
});


router.get('/studentByCourse/:courseId', function(req, res){
	req.db.collection('TimeTable').find({courseId: req.params.courseId}, function(err, timetables){
		var studentIds = timetables.map(function(c) { return c.studentId; });
		req.db.collection('students').find({_id: {$in: studentIds}}, function(e, doc){
			res.json(doc);
		})
	});
});

router.get('/availableStudentByCourse/:courseId', function(req, res){
	req.db.collection('TimeTable').find({courseId: req.params.courseId}, function(err, timetables){
		var studentIds = timetables.map(function(c) { return c.studentId; });
		//only one change from $in to $nin
		req.db.collection('students').find({_id: {$nin: studentIds}}, function(e, doc){
			res.json(doc);
		})
	});
});

router.post('/enrolment', function(req, res){
	console.log(req.body);
	req.db.collection('TimeTable').insert(req.body, function(e, docs){
		res.json(docs);
	});
});


router.get('/student/search/:name', function(req, res){
	var query = {
	  name: {
	    $regex: '^'+req.params.name+'',
	    $options: 'i' //i: ignore case, m: multiline, etc
	  }
	};
	req.db.collection('students').find(query, function(e, doc){
		res.json(doc);
	})
});

router.post('/students/addCourse', function(req, res){

});
//////////////

////////////////////

///QUIZ_TOOL.EJS
app.use('/', router);

router.get('/quizes', function(req, res) {
    req.db.collection('quizes').find({},{"limit": 100},function(e,docs){
        res.json(docs);
    });
});

router.get('/quiz/:id', function(req, res){
	req.db.collection('quizes').findById(req.params.id, function(e, doc){
		res.json(doc);
	})
});

router.put('/quiz/:id', function(req, res){
	req.db.collection('quizes').update({_id: req.params.id}, {name: req.body.name, time: req.body.time});
	req.db.collection('quizes').findById(req.params.id, function(e, doc){
		res.json(doc);
	})

});

router.delete('/quiz/:id', function(req, res){
	req.db.collection('quizes').remove({_id: req.params.id}, function(e, doc){
		res.json(doc);
	})
});

router.post('/quizes', function(req, res){

	console.log(req.body);
	req.db.collection('quizes').insert(req.body, function(e, docs){
		res.json(docs);
	});
});


router.get('/questionByQuiz/:quizId', function(req, res){
	req.db.collection('TimeTable').find({quizId: req.params.quizId}, function(err, timetables){
		var questionIds = timetables.map(function(c) { return c.questionId; });
		req.db.collection('questions').find({_id: {$in: questionIds}}, function(e, doc){
			res.json(doc);
		})
	});
});

router.get('/availableQuestionByQuiz/:quizId', function(req, res){
	req.db.collection('TimeTable').find({questionId: req.params.questionId}, function(err, timetables){
		var questionIds = timetables.map(function(c) { return c.questionId; });
		//only one change from $in to $nin
		req.db.collection('questions').find({_id: {$nin: questionIds}}, function(e, doc){
			res.json(doc);
		})
	});
});

router.post('/questionadd', function(req, res){
	console.log(req.body);
	req.db.collection('TimeTable').insert(req.body, function(e, docs){
		res.json(docs);
	});
});


/////////////////
///QUESTION DATABASE
app.use('/', router);

router.get('/questions', function(req, res) {
    req.db.collection('questions').find({},{"limit": 100},function(e,docs){
        res.json(docs);
    });
});

router.get('/question/:id', function(req, res){
	req.db.collection('questions').findById(req.params.id, function(e, doc){
		res.json(doc);
	})
});

router.put('/question/:id', function(req, res){
	req.db.collection('questions').update({_id: req.params.id}, {name: req.body.name, questionType: req.body.questionType, mcquestionPrompt: req.body.mcquestionPrompt, mcCorrectAnswer: req.body.mcCorrectAnswer, mcWrongAnswer1: req.body.mcWrongAnswer1, mcWrongAnswer2: req.body.mcWrongAnswer2, mcWrongAnswer3: req.body.mcWrongAnswer3, saquestionPrompt: req.body.saquestionPrompt, saCorrectAnswer: req.body.saCorrectAnswer, tfquestionPrompt: req.body.tfquestionPrompt, tfCorrectAnswer: req.body.tfCorrectAnswer, gfquestionPrompt: req.body.gfquestionPrompt, gfCorrectAnswer: req.body.gfCorrectAnswer, maquestionPrompt: req.body.maquestionPrompt, macolA1: req.body.macolA1, macolB1: req.body.macolB1, macolA2: req.body.macolA2, macolB2: req.body.macolB2, macolA3: req.body.macolA3,  macolB3: req.body.macolB3, macolA4: req.body.macolA4,  macolB4: req.body.macolB4});
	req.db.collection('questions').findById(req.params.id, function(e, doc){
		res.json(doc);
	})

});

router.delete('/question/:id', function(req, res){
	req.db.collection('questions').remove({_id: req.params.id}, function(e, doc){
		res.json(doc);
	})
});

router.post('/questions', function(req, res){

	console.log(req.body);
	req.db.collection('questions').insert(req.body, function(e, docs){
		res.json(docs);
	});
});
//////////////
////TEACHING_LIBRARY.EJS

//////// CREATE DIRECTORY FUNCTION
  
app.use('/', router);

router.get('/folders', function(req, res) {
    req.db.collection('folders').find({},{"limit": 100},function(e,docs){
        res.json(docs);
    });
});

router.get('/folder/:id', function(req, res){
	req.db.collection('folders').findById(req.params.id, function(e, doc){
		res.json(doc);
	})
});

router.put('/folder/:id', function(req, res){
	req.db.collection('folders').update({_id: req.params.id}, {name: req.body.name});
	req.db.collection('folders').findById(req.params.id, function(e, doc){
		res.json(doc);
	})

});


router.delete('/folder/:id', function(req, res){
	req.db.collection('folders').remove({_id: req.params.id}, function(e, doc){
		res.json(doc);
	})
});

router.post('/folders', function(req, res){

	console.log(req.body);
	req.db.collection('folders').insert(req.body, function(e, docs){
		res.json(docs);
	});
});

////////////// UPLOAD FUNCTION
app.use('/', router);

var storage = multer.diskStorage({

destination: function (req, file, callback) {

callback(null, './uploads'); //same folder as upload.js

},

filename: function (req, file, callback) {

callback(null, Date.now()+ path.extname(file.originalname));

}

});

var upload = multer({ storage : storage }).array('userPhoto',5);

////////////////

//upload file

router.post('/uploads',function(req,res){

upload(req,res,function(err) {

if(err) {

return res.end("Error uploading file.");

}

res.end("File is uploaded");

});

});

///////////////////////////////


//get list of files

router.get('/download', function(req, res) { // create download route

var dir=path.resolve(".")+'/uploads/'; // give path

fs.readdir(dir, function(err, list) { // read directory return error or list

if (err)

return res.json(err);

else

res.json(list);

});

});


//////////////////////////////


//download file

router.get('/download/:file(*)', function(req, res, next){ // this routes all types of file

var file = req.params.file;

var path = require('path');

var path = path.resolve(".")+'/uploads/'+file;

res.download(path); // magic of download function

});
////////////////







////////////////
module.exports = app;
app.listen(8080);