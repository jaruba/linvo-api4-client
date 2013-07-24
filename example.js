var LinvoAPI = require("./client.js");

var api = new LinvoAPI({
	host: "localhost",
	port: 3008
});

//var api = new LinvoAPI();

api.options.authenticate = function() 
{
	console.log("Authenticating...");
	
	api.login("ivo@linvo.org", "XXXXXX", function(err, resp)
	{
		console.log(resp);
	});
}

var start = Date.now();
api.request("cinematicRequest", { meta: { tvdb_id: 264492, season: 1, episode: 1, name: "under the dome" } }, function(err, res)
{
	console.log("cinematic",res,Date.now()-start);
});

setInterval(function()
{
	console.log(api.user)
},5000);
