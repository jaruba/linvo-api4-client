var LinvoAPI = require("./client.js");
var async = require("async");

var api = new LinvoAPI({
//	host: "localhost", port: 3008
});

var testCases = [
    {"tvdb_id":79349,"name":"Dexter","episode":8,"season":7},
    {"tvdb_id":258744,"name":"The Following","episode":1,"season":1},
    {"tvdb_id":73244,"name":"The Office (US)","episode":1,"season":9}, 
    {"tvdb_id":73244,"name":"The Office (US)","episode":5,"season": 9},
    {"tvdb_id":73244,"name":"The Office (US)","episode":24,"season": 9}, 
    {"tvdb_id":73244,"name":"The Office (US)","episode":1,"season": 6}, 
    {"tvdb_id":73244,"name":"The Office (US)","episode":1,"season": 7}, 
    {"tvdb_id":73244,"name":"The Office (US)","episode":1,"season": 1}, 
    {"tvdb_id":73244,"name":"The Office (US)","episode":1,"season": 2}, 
    {"tvdb_id":73244,"name":"The Office (US)","episode":1,"season": 3}, 
    {imdb_id: "tt0435761", name: "Toy Story 3"},
    {imdb_id: "tt0114709", name: "Toy Story"},
    {"imdb_id":"tt0120915","name":"Star Wars: Episode I - The Phantom Menace"},
    {"imdb_id":"tt0102926","name":"The Silence of the Lambs"},
    {"imdb_id":"tt0796366","name":"Star Trek"},
//    {"tvdb_id":270457,"name":"The Call Centre","episode":1,"season":1}, // TODO
    {"tvdb_id":264492,"name":"Under the Dome","episode":1,"season":1},
    {"imdb_id":"tt0252866","name":"American Pie 2"},
    {"tvdb_id":77466,"name":"Ed, Edd n' Eddy","episode":1,"season":1},
    {"tvdb_id":72860,"name":"Tom and Jerry","episode":1,"season":1},
    {"tvdb_id":73838,"name":"Malcolm in the Middle","episode":1,"season":1},
    {"tvdb_id":75978,"name":"Family Guy","episode":1,"season":1},
    {"tvdb_id":75897,"name":"South Park","episode":1,"season":1},
    {"tvdb_id":78020,"name":"ALF","episode":1,"season":1},
    {"tvdb_id":79349,"name":"Dexter","episode":1,"season":1},
    {"tvdb_id":75760,"name":"How I Met Your Mother","episode":1,"season":1},
    {"tvdb_id":78804,"name":"Doctor Who (2005)","episode":1,"season":1},
    {"tvdb_id":84912,"name":"Parks and Recreation","episode":1,"season":1},
    {"tvdb_id":121361,"name":"Game of Thrones","episode":1,"season":1},
    {"tvdb_id":213081,"name":"Dirk Gently","episode":1,"season":1},
    {"tvdb_id":262414,"name":"Bates Motel","episode":1,"season":1},
    {"tvdb_id":259669,"name":"Da Vinci's Demons","episode":1,"season":1},
    {"imdb_id":"tt0289879","name":"The Butterfly Effect"},
    {"imdb_id":"tt0144084","name":"American Psycho"},
    {"imdb_id":"tt0383574","name":"Pirates of the Caribbean: Dead Man's Chest"},
    {"imdb_id":"tt0367959","name":"Hannibal Rising"},
    {"tvdb_id":73244,"name":"The Office (US)","episode":1,"season":1},
    {"imdb_id":"tt0212985","name":"Hannibal"},
    {"imdb_id":"tt0371724","name":"The Hitchhiker's Guide to the Galaxy"},
    {"imdb_id":"tt0109830","name":"Forrest Gump"},
    {"imdb_id":"tt0158983","name":"South Park: Bigger Longer & Uncut"},
    {"imdb_id":"tt0325980","name":"Pirates of the Caribbean: The Curse of the Black Pearl"},
    {"imdb_id":"tt0121765","name":"Star Wars: Episode II - Attack of the Clones"},
    {"imdb_id":"tt0082509","name":"Heavy Metal"},
    {"tvdb_id":73940,"name":"'Allo 'Allo!","episode":1,"season":1},
    {"tvdb_id":80379,"name":"The Big Bang Theory","episode":1,"season":1},
    {"imdb_id":"tt0121766","name":"Star Wars: Episode III - Revenge of the Sith"},
    {"imdb_id":"tt0974959","name":"American Pie Presents Beta House"},
    {"imdb_id":"tt0087469","name":"Indiana Jones and the Temple of Doom"},
    {"imdb_id":"tt0097576","name":"Indiana Jones and the Last Crusade"},
//    {"imdb_id":"tt0460740","name":"Cashback"},
    {"imdb_id":"tt1319733","name":"Road Trip: Beer Pong"},
    {"imdb_id":"tt0076759","name":"Star Wars"},
    {"imdb_id":"tt0120737","name":"The Lord of the Rings: The Fellowship of the Ring"},
    {"imdb_id":"tt0086973","name":"Blame It on Rio"},
    {"imdb_id":"tt1345836","name":"The Dark Knight Rises"},
    {"imdb_id":"tt0082971","name":"Raiders of the Lost Ark"},
    {"imdb_id":"tt0289765","name":"Red Dragon"},
    {"imdb_id":"tt0167261","name":"The Lord of the Rings: The Two Towers"},
    {"imdb_id":"tt0114436","name":"Showgirls"},
    {"imdb_id":"tt1853728","name":"Django Unchained"},
    {"imdb_id":"tt0091474","name":"Manhunter"},
    {"imdb_id":"tt1285016","name":"The Social Network"},
    {"imdb_id":"tt0167260","name":"The Lord of the Rings: The Return of the King"},
    {"tvdb_id":259063,"name":"Hannibal","episode":1,"season":1},
//    {"imdb_id":"tt1232047","name":"Ed, Edd n Eddy's Big Picture Show"},
    {"imdb_id":"tt0163651","name":"American Pie"},
    {"imdb_id":"tt0370263","name":"AVP: Alien vs. Predator"},
    {"imdb_id":"tt0086190","name":"Star Wars: Episode VI - Return of the Jedi"},
    {"imdb_id":"tt0080684","name":"Star Wars: Episode V - The Empire Strikes Back"},
];

async.eachSeries(testCases, function(query, cb)
{
    console.log("\n\n--> "+query.name+" // "+(query.tvdb_id || query.imdb_id)+(query.tvdb_id ? " // "+query.season+"x"+query.episode : ""));
    var start = Date.now();
    
    var timeout = setTimeout(function()
    {
        console.log("request timed out");
        cb(true);
    }, 8000);

    api.request("cinematicRequest", { meta: query }, function(err, resp)
    {
        clearTimeout(timeout);
        
        if (!resp || err) 
        {
            console.log(err || "blank response returned");
            return cb(true);
        }
        if (! resp.torrent)
        {
            console.log("Did not find a torrent");
            return cb(true);
        }
        resp.torrent = !!resp.torrent; // don't console-log that
        console.log(Date.now() - start, resp);
        cb();
    });
}, function()
{
    console.log("finished tests");
});
