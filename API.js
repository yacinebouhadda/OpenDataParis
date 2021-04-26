//Service de publication World Wide Web
//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.  

//Ajouter le xml    choisir le type de dataset    les routes de l'api

/* Faire le dataset comme une liste

faire l'extraction des resultats en csv */


var express = require('express'); 
var bodyParser = require("body-parser"); 

var multer = require('multer');

var app = express(); 
app.use(express.static('public'));

 
// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost'; 
var port = 3000; 
 



var mysql = require("mysql");

app.use(function(req, res, next){
	res.locals.connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : '',
		database : 'projetapi'
		
	});
	
	res.locals.connection.connect();
	next();
});

let upload={
	storage: multer.diskStorage({
		destination: (req,file,next)=>{
			next(null,'./public/uploads')
		}

	})

}




app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes. 
var myRouter = express.Router(); 
 
// Je vous rappelle notre route (/librarys).  

// J'implémente les méthodes GET, PUT, UPDATE et DELETE
// GET
/*.get(function(req,res){ 
 res.json({
 message : "Liste les librarys de Lille Métropole avec paramètres :",
 DistrictLib : req.query.DistrictLib,
 nbResultat : req.query.maxresultat, 
 methode : req.method });
 
})*/
myRouter.route('/Api/v1/library')
.get(function(req, res, next) {
	//-les parametres qui sont dans bdd
	if(req.query.idLibrary == undefined && req.query.libName == undefined && req.query.DistrictLib == undefined && req.query.NBplace == undefined){
		res.locals.connection.query('SELECT * from library', function (error, results, fields) {
			if(error){
				res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
			}
			else{
			res.send(JSON.stringify({
			"message" : "Liste des bibliotheques:",
			"response": results}));
			}
		});
	}
	else 
	{
		var where=" where ";
		
		if(req.query.idLibrary != undefined)
		{
			where += "idLibrary= "+req.query.idLibrary;
		}
		if(req.query.libName != undefined){
			if(req.query.idLibrary != undefined){
				where += ' and libName= "'+req.query.libName+'"';
			}
			else{
				where += '  libName= "'+req.query.libName+'"';
			}
		}
		if(req.query.DistrictLib != undefined){ 
			if(req.query.idLibrary != undefined || req.query.libName != undefined ){
				where +=' and DistrictLib= "'+req.query.DistrictLib+'"';
			}
			else{
				where +='  DistrictLib= "'+req.query.DistrictLib+'"';
			}
		}
		if(req.query.NBplace != undefined){ 
			if(req.query.idLibrary != undefined || req.query.libName != undefined || req.query.DistrictLib != undefined){
				where +=' and NBplace= "'+req.query.NBplace+'"';
			}
			else{
				where +=' NBplace= "'+req.query.NBplace+'"';
			}
		}
		res.locals.connection.query('SELECT * from library '+where , function (error, results, fields) {
							if(error){
								res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
							}
							else{
							res.send(JSON.stringify({
							"message" : "les library: ",
							"response": results}));
							}
						});
		}
					
})


// ... code 
//POST
/*.post(function(req,res){

 res.json({message : "Ajoute une nouvelle library à la liste", 
 libName : req.body.libName, 
 DistrictLib : req.body.DistrictLib, 
 NBplace : req.body.NBplace,
 methode : req.method});
})// ... code*/
.post(function(req,res){
	var params=req.body;

	res.locals.connection.query('INSERT INTO library SET ?', params, function (error, results, fields) {
		if(error) throw error;
		res.end(JSON.stringify(results));
		
	});
})

//PUT
.put(function(req,res){ 
      res.json({message : "Mise à jour des informations d'une library dans la liste", methode : req.method});
})
//DELETE
app.delete(function(req,res){ 
res.json({message : "Suppression d'une library dans la liste", methode : req.method});  
}); 
 
// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);  
 
myRouter.route('/')
// all permet de prendre en charge toutes les méthodes. 
.all(function(req,res){ 
	  res.render('home.ejs');
     //res.json({message : "Bienvenue sur notre Frugal API ", methode : req.method});
});
var path = require('path');

app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}))
app.post('/ImportExport/file',multer(upload).single("file"), callName); 

const fs = require('fs');


function callName(req, res) { 
	
	//var identifiant = req.body.identifiant;
	//var mdp = req.body.mdp; 
	var file = req.file;

	//console.log(file.__dirname);
	if(file != null){
		fs.readFile("./public/uploads/"+file.filename, 'utf8', function (err, data) {
			var data = data.split(/\r?\n/);
			//data[1]=data[1].split(";").join(",'");
				var champs=data[1].split(';');;
				var requete="('"+champs[0]+"','"+champs[1]+"','"+champs[2]+"','"+champs[3]+"')," ;
				for(var i=2;i<data.length-1;i++){
					if(i<data.length-2){	
						champs=data[i].split(';');
						requete+= "('"+champs[0]+"','"+champs[1]+"','"+champs[2]+"','"+champs[3]+"')," 
					}
					else{
						champs=data[i].split(';');
						requete+= "('"+champs[0]+"','"+champs[1]+"','"+champs[2]+"','"+champs[3]+"')" 
					}
				}
				
				res.locals.connection.query("INSERT INTO library values "+requete+";", function (error, results, fields) {
				if(error) throw error;
				res.end(JSON.stringify(results));
				
				});

		});
	}	
	res.render("home.ejs")
} 

app.get('/ImportExport',renderImport);
function renderImport(req,res){
	res.render("ImportExport.ejs", {erreur:0,telechargement:0})
}

app.get('/API',renderAPI);
function renderAPI(req,res){
	res.render("API.ejs",{dataset:null,exporte:null,requette:null })
}


//télécharger toute la bdd depuis l'interface du
app.post('/download', callNameGet); 
const Json2csvParser = require("json2csv").Parser;

function callNameGet(req, res) { 
	var dataset=req.body.liste;
	res.locals.connection.query('SELECT * from '+dataset, function (error, data, fields) {
		
		if (error) {
			res.render("ImportExport.ejs",{erreur:1,telechargement:0});
		}
		else{
			const jsonData = JSON.parse(JSON.stringify(data));
		

			const json2csvParser = new Json2csvParser({ header: true});
			const csv = json2csvParser.parse(jsonData);

			fs.writeFile("D:/Pro Doc/M1 EPSI/MSPR 3/Dev/Yacine/Dev/download/download.csv", csv, function(error) {
			
				console.log("Write to download.csv successfully!");
				res.render("ImportExport.ejs",{erreur:0,telechargement:1});
			
			});	
		}	
	});
} 

/*recuperer les fichiers télécharger depuis la bdd, a partir de l'api*/
app.post('/download1', callNameGet1); 
function callNameGet1(req, res) { 
	var requete=req.body.requete;
	console.log("aaaa "+requete.length);
	if(requete.length > 5 ){
		res.locals.connection.query(requete, function (error, data, fields) {
			if(error){
				res.render("API.ejs", {dataset : error,requette:requete, exporte:null });
			}
			const jsonData = JSON.parse(JSON.stringify(data));

			const json2csvParser = new Json2csvParser({ header: true});
			const csv = json2csvParser.parse(jsonData);

			fs.writeFile("D:/Pro Doc/M1 EPSI/MSPR 3/Dev/Yacine/Dev/download/download1.csv", csv, function(error) {
				if (error) throw error;
				console.log("Write to download.csv successfully!");
				res.render("API.ejs", {dataset : null,requette:null , exporte:1});
			});	
			
		});
	}
	else{
		res.render("API.ejs", {dataset : null,requette:null, exporte:null });
	}
} 




/* app.post('/API1',renderAPI1);
function renderAPI1(req,res){
	var dataset=req.body.dataset;
	var rows=req.body.rows;
	var sort=req.body.sort;
	
	console.log("data= "+dataset+" sort= "+sort+" rows= "+rows)
	res.render("API.ejs")
} */

myRouter.route('/API1/v1')
.post(function(req,res){ 
	var dataset=req.body.liste;
	var rows=req.body.rows;
	var sort=req.body.sort;
	var libraryid=req.body.idLibrary;
	var librarylibName=req.body.libName;
	var libraryDistrictLib=req.body.DistrictLib;
	var libraryNBplace=req.body.NBplace;

	var autreid=req.body.idautre;
	var autrelibName=req.body.libNameautre;


	console.log("data= "+dataset+" sort= "+sort+" rows= "+rows)

	  var requete;
	  
	  	if(dataset == ""){
			res.render("API.ejs", {dataset : null,requete:requete, exporte:null});
	  	}
		else{  		
			var select="";
			console.log("aaaaa  "+libraryid+" bbb "+librarylibName+" cc "+libraryDistrictLib);
			if(libraryid=="on"){
				select+="idLibrary";
			}
			if(librarylibName=="on"){
				if(libraryid=="on"){
					select += ",libName";
				}
				else {
					select += "libName";
				}
			}
			if(libraryDistrictLib=="on"){
				if(libraryid=="on" || librarylibName=="on"){
					select += ",DistrictLib";	
				}
				else {
					select += "DistrictLib";	
				}
			}
			if(libraryNBplace=="on"){
				if(libraryid=="on" || librarylibName=="on" || libraryDistrictLib=="on" ){
					select += ",NBplace";
				}
				else {
					select +="NBplace";
				}
			}
			if(libraryid==undefined && librarylibName==undefined && libraryDistrictLib==undefined && libraryNBplace==undefined){
				select += "*"
			}



			var requette='SELECT '+select+' from '+dataset+' order by '+sort+' LIMIT '+rows ;
			if(rows == "" && sort == ""){
				requette='SELECT '+select+' from '+dataset+' LIMIT 10' ;
			}
			else if(rows == "" && sort != ""){
				requette='SELECT '+select+' from '+dataset+' order by '+sort+' LIMIT 10' ;
			}
			else if (rows != "" && sort == ""){
				requette='SELECT '+select+' from '+dataset+' LIMIT '+rows ;
			}

			res.locals.connection.query(requette, function (error, results, fields) {
				if(error){
					res.render("API.ejs", {dataset : error,requette:requette, exporte:null });
					
				}
				else{
					res.render("API.ejs", {dataset : JSON.stringify({ results}),requette:requette, exporte:null });	  	  
					/* res.send(JSON.stringify({
						"message" : "la library avec id : "+req.params.id,
						"response": results})) */;
				}

				console.log("aa= "+results);
			});
		}
})



.put(function(req,res){ 
	  res.json({message : "update library n°" + req.params.id});
})
.delete(function(req,res){ 
	  res.json({message : "drop library n°" + req.params.id});
});





// Démarrer le serveur 
app.listen(port, hostname, function(){
    console.log("server run on http:"+ hostname +":"+port+"\n");
});
 