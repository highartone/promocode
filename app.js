var events = require('events'),
	director = require('director'),
	http = require('http'),
	JUST = require('just');

var APP = function(config){
	/** System property and config */
	events.EventEmitter.call(this);
	this.config = config;
	var self = this;

	/** DB connect */
	this.redis = require('redis').createClient(config.get('db:redis:port'),config.get('db:redis:host'));

	/** Modules and libs */
    this.fs = require('fs');
	this.md5 = require('md5');
	this.exec = require('exec');
	this.request = require('request');
    this.pixel = this.fs.readFileSync(__dirname+'/pixel.gif');
	this.URL = require('url');
	this.moment = require('moment');
	this.router = new director.http.Router();
	this.Categories = require('./models/categories');
	this.Shops = require('./models/shops');
	this.Promocodes = require('./models/promocodes');
	this.Banners = require('./models/banners');
	this.multiparty = require('multiparty');

    /** director routing*/
	this.router.path('',function(){
		this.get(function(){require('./routes/index.js')(this.req,this.res,self)});
	});
	this.router.path(/shop=(\d+)/,function(){
		this.get(function(shop){require('./routes/shop.js')(this.req,this.res,self,shop)});
	});
	this.router.path(/promocode=(\d+)/,function(){
		this.get(function(promocode){require('./routes/promocode.js')(this.req,this.res,self,promocode)});
	});
	this.router.path('shops',function(){
		this.get(function(){require('./routes/shops.js')(this.req,this.res,self)});
	});
	this.router.path(/more=(\d+)&category=(\d+)&shop=(\d+)&search=([\s\S]*)/,function(){
		this.get(function(offset, category, shop, search){require('./routes/more.js')(this.req,this.res,self,offset,category,shop,search)});
	});
	this.router.path(/(promocodes|shops)&category=(\d+)/,function(){
		this.get(function(pageName, category){require('./routes/category.js')(this.req,this.res,self,pageName,category)});
	});
	this.router.path(/search([\s\S]*)/,function(){
		this.get(function(){require('./routes/search.js')(this.req,this.res,self)});
	});
	this.router.path(/stat=(\d+)/,function(){
		this.get(function(id){require('./routes/stat.js')(this.req,this.res,self,id)});
	});
	this.router.path('banner',function(){
		this.get(function(){require('./routes/banner.js')(this.req,this.res,self)});
	});
	this.router.path('bannerSave',function(){
		this.post(function(){require('./routes/banner.js')(this.req,this.res,self)});
	});
	this.router.path(/bannerSave&id=([\s\S]*)&dir=([\s\S]{2})/,function(){
		this.get(function(id,dir){require('./routes/banner.js')(this.req,this.res,self,id,dir)});
	});

	if(this.config.get('local')){
		this.router.path(/\/(js|css|img|fonts|)\/([\s\S]*)\.(js|css|jpeg|jpg|png|otf|eot|ttf|woff|woff2|svg)/,function(){
			this.get(function(nameDir, nameFile, formatFile){
				var data = self.fs.readFileSync(__dirname+'/public/'+nameDir+'/'+nameFile+'.'+formatFile);
				if(formatFile == 'css'){this.res.setHeader('Content-Type', 'text/css');}
				if(formatFile == 'jpeg'){this.res.setHeader('Content-Type', 'image/jpeg');}
				if(formatFile == 'jpg'){this.res.setHeader('Content-Type', 'image/jpeg');}
				if(formatFile == 'png'){this.res.setHeader('Content-Type', 'image/png');}
				if(formatFile == 'js'){this.res.setHeader('Content-Type', 'text/javascript');}
				this.res.write(data);
				this.res.end();
			});
		});
		this.router.path(/\/(img\/banners\/[\w]{2}\/[\w]{2})\/([\w]{8})\.(png|jpg|jpeg)/,function(){
			this.get(function(nameDir, nameFile, formatFile){
				var data = self.fs.readFileSync(__dirname+'/public/'+nameDir+'/'+nameFile+'.'+formatFile);
				if(formatFile == 'jpeg'){this.res.setHeader('Content-Type', 'image/jpeg');}
				if(formatFile == 'jpg'){this.res.setHeader('Content-Type', 'image/jpeg');}
				if(formatFile == 'png'){this.res.setHeader('Content-Type', 'image/png');}
				this.res.write(data);
				this.res.end();
			});
		});
	}

	this.routing = function(req,res){
		self.router.dispatch(req, res, function (err) {
			if (err) {
				if(err.status == 404){
					res.writeHead(404);
					res.end();
				} else{
					console.log(err);
					res.end();
				}
			}
		});
	};
    
    /** require template engine */
    this.just = new JUST({ root : __dirname + '/views', useCache : true, ext : '.html' });

};
APP.prototype.__proto__ = events.EventEmitter.prototype;
var app = new APP(require('./config'));
/** Create app object */
module.exports = app;
