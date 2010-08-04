steal("//steal/generate/ejs", '//steal/generate/inflector', function(steal){

var render = function(from, to, data){
	var text = readFile(from);
	
	var res = new steal.EJS({ text : text, name: from }).render(data);
	new steal.File(to).save(res);
},
	
/**
 * @plugin steal/generate
 * @parent stealtools
 * The Generate plugin makes building code generators crazy easy.
 * The steal project is packaged with code generators for JavaScriptMVC, but you can build 
 * your own very easily.
 * <h2>Packaged Generators</h3>
<ul>
<li><code>app</code> - creates a JavaScriptMVC application structure.
@codestart text
js steal/generate/app <i>path/to/app</i> [OPTIONS]
@codeend
<dl>
	<dt>path/to/app</dt>
	<dd>The lowercase path you want your application in. Keep application names short because they 
		are used as namespaces.  The last part of the path will be taken to be your application's name.
	</dd>
</dl>
</li>
<li style='padding-top: 10px;'><code>controller</code> - creates a JavaScriptMVC [jQuery.Controller].
@codestart text
js steal/generate/controller <i>App.Controllers.Name</i> [OPTIONS]
@codeend
<dl>
	<dt>App.Controllers.Name</dt>
	<dd>The namespaced name of your controller.  For example, if your controller is named
		<code>Cookbook.Controllers.Recipe</code>, the generator will create 
		<code>cookbook/controllers/recipe_controller.js</code>. 
	</dd>
</dl>
</li>

<li style='padding-top: 10px;'><code>model</code> - creates a JavaScriptMVC [jQuery.Model].
@codestart text
js steal/generate/model <i>App.Models.Name</i> [TYPE] [OPTIONS]
@codeend
<dl>
	<dt>App.Models.Name</dt>
	<dd>The namespaced name of your model.  For example, if your model is named
		<code>Cookbook.Models.Recipe</code>, the generator will create 
		<code>cookbook/models/recipe.js</code>. 
	</dd>
</dl>
</li>

<li style='padding-top: 10px;'><code>page</code> - creates a page that loads steal.js and an application.
@codestart text
js steal/generate/model <i>path/to/app</i> <i>path/to/page.html</i>
@codeend
<dl>
	<dt>path/to/app</dt>
	<dd>The path to your apps folder. 
	</dd>
	<dt>path/to/page.html</dt>
	<dd>The path to the page you want to create. 
	</dd>
</dl>
</li>

<li style='padding-top: 10px;'><code>plugin</code> - creates a JavaScriptMVC plugin file and folder structure.
@codestart text
js steal/generate/plugin <i>path/to/plugin</i> [OPTIONS]
@codeend
<dl>
	<dt>path/to/plugin</dt>
	<dd>The path to where you want your plugin.  This also should be the namespace and name of
	whatever JavaScript object created.  Check out phui for examples.
	</dd>
</dl>
</li>
<li style='padding-top: 10px;'><code>scaffold</code> - creates the controllers, models, and fixtures used
to provide basic CRUD functionality..
@codestart text
js steal/generate/scaffold <i>App.Models.ModelName</i> [OPTIONS]
@codeend
<dl>
	<dt>App.Models.ModelName</dt>
	<dd>The model resource you want to add CRUD functionality to.
	</dd>
</dl>
</li>
</ul>

<h2>The Generator Function</h2>
<p>Renders a folders contents with EJS and data and then copies it to another folder.</p>

 * @param {String} path the folder to get templates from
 * @param {String} where where to put the results of the rendered templates
 * @param {Object} data data to render the templates with
 */
generate = (steal.generate = function(path, where, data){
	//get all files in a folder
	var folder = new steal.File(path);
	
	//first make sure the folder exists
	new steal.File(where).mkdirs();
	
	folder.contents(function(name, type, current){
		var loc = (current? current+"/" : "")+name,
			convert = loc.replace(/\(([^\)]+)\)/g, function(replace, inside){
				return data[inside];
			})
		
		if(type == 'file'){
			//if it's ejs, draw it where it belongs
			if(/\.ejs$/.test(name)){
				var put = where + "/"+convert.replace(/\.ejs$/,"");
				print('      ' +put )
				render(path+"/"+loc, put, data);
				
			}else if(/\.link$/.test(name)){
				var copy = readFile(path+"/"+loc) 					
				//if points to a file, copy that one file; otherwise copy the folder
				steal.generate(copy, where + "/"+convert.replace(/\.link$/,""), data);
				
				
				
			}
		}else{
			
			//create file
			print('      '+where + "/"+convert);
			new steal.File(where + "/"+convert).mkdirs();
			
			//recurse in new folder
			new steal.File(path+"/"+(current? current+"/" : "")+name)
				.contents(arguments.callee,(current? current+"/" : "")+name)
		}
	})
});
steal.extend(generate,{
	regexps: {
        colons : /::/,
        words: /([A-Z]+)([A-Z][a-z])/g,
        lowerUpper : /([a-z\d])([A-Z])/g,
        dash : /([a-z\d])([A-Z])/g
	},
	underscore: function(s){
        var regs = this.regexps;
        return s.replace(regs.colons, '/').
                 replace(regs.words,'$1_$2').
                 replace(regs.lowerUpper,'$1_$2').
                 replace(regs.dash,'_').toLowerCase()
    },
	//converts a name to a bunch of useful things
	convert: function(name){
	    var className = name.match(/[^\.]*$/)[0] //Customer
	    var appName = name.split(".")[0] //Customer
		return {
	        underscore : generate.underscore(className),
			path : generate.underscore(name).replace(/\./g,"/").replace(/\/[^\/]*$/,""),
	        name : name,
			fullName : name,
			className : className,
			plural: steal.Inflector.pluralize(generate.underscore(className)),
			appName: appName.toLowerCase()
		}
    },
	render : render
});
	
});




