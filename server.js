const express = require('express');
const app = express();
const bodyParser=require("body-parser");
const PORT = process.env.PORT||8000;
const fs = require("fs");
app.use(bodyParser.json());
app.get("/explorer",(req,res)=>{
	var path=__dirname+"/explore"+(req.query.path||'');
	fs.lstat(path,(err, stats) =>{
		if(stats.isFile()){
			var text=fs.readFileSync(path,'utf-8');
			res.send({
				type:'file',
				data:text
			});
		}else{
			fs.readdir(path, function(err, items) {
				res.send({
					type:'dir',
					files:items
				})
			});
		}
	});
});
app.post('/read-file',(req,res)=>{
	var path=__dirname+"/explore/"+req.body.dir+'/'+req.body.file;
	fs.lstat(path,(err, stats) =>{
		if(err){
			res.status(500).send({
				error:err,
				status:false
			})
		}else{
			if(stats.isFile()){
				var text=fs.readFileSync(path,'utf-8');
				res.send({
					type:'file',
					data:text
				});
			}else{
				fs.readdir(path, function(err, items) {
					var final=items.map((fileName)=>{
						var text=fs.readFileSync(path+'/'+fileName,'utf-8');
						return {
							type:'file',
							fileName:fileName,
							text:text
						}
					})
					res.send({
						status:true,
						data:final
					})
				});
			}
		}
	});
});
app.get("/",(req,res)=>{
	res.sendFile(__dirname+"/public/index.html");
});
app.use(express.static("./public"));

app.listen(PORT,(err)=>{
	console.log(err||('Running on port '+PORT));
});