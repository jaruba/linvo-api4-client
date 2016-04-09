var _ = require("lodash"),
    async = require("async");

/* Prep: user storage; the Linvo account is tied to your system account
 */
if (typeof(localStorage)==="undefined") localStorage = { }; // in memory
function loadUser()
{
    if (module.exports.useFs) LinvoAPI.storePath = LinvoAPI.storePath || require('path').join(process.env.APPDATA || process.env.HOME || "", ".linvo-user");
    try {
        var str = !module.exports.useFs ? localStorage.linvoUser : require('fs').readFileSync(LinvoAPI.storePath);
        return str ? JSON.parse(str) : undefined;
    } catch(e) { console.log(e) };
}
var saveQueue = async.queue(function(task, cb) {  require('fs').writeFile(task.path, task.data, cb) }, 1);
function saveUser(user)
{
    if (!module.exports.useFs) { localStorage.linvoUser = JSON.stringify(user); return }
    saveQueue.push({ path: LinvoAPI.storePath, data: JSON.stringify(user)  })
}


/* Linvo API
 */
function LinvoAPI(options)
{
    this.options = _.extend({ host: "api.linvo.me", port: 80 }, options || {});

    var load = options.loadUser || loadUser;
    var save = options.saveUser || saveUser;
    
    this.user = load();
    this.connected = true;
    
    var api = this,
        client = api.options.client || require("jayson").client.http({ host: api.options.host, port: api.options.port, path: "/rpc" });
    
    // TODO: watch storePath, update on change
    
    setTimeout(function()
    {
        /* Initialize
         */
        if (!api.user && typeof(api.options.authenticate) == "function")
            api.options.authenticate();
        
        var authKey = api.user && api.user.authKey;
        api.user && client.request("getUser", [ { authKey: authKey } ], function(err, error, remoteUser)
        {
            api.connected = err ? false : true;
            if (err) // We shouldn't reset the auth upon a network error
                return console.error("LinvoAPI network error", err);                
            
            // We don't have a valid session: flush the user object and call authenticate
            if (! (remoteUser && remoteUser.email))
            {
                save(api.user = null);
                (typeof(api.options.authenticate) == "function") && api.options.authenticate();
                return;
            }
            
            var currentUser = api.user || {};
            
            if (remoteUser.lastModified < currentUser.lastModified) // local user is newer than the remote one
                setTimeout(function() { api.request("saveUser", api.user) }, 500);
            else // remote user is newer
                api.user = remoteUser;
            
            api.user.authKey = authKey;
            save(api.user);
            (typeof(api.options.onUserUpdate) == "function") && api.options.onUserUpdate();
        });
    }, 0);

    api.request = function(method, args, cb)
    {
        client.request(method, [ _.merge({ authKey: api.user && api.user.authKey }, args) ], function(err, error, resp)
        {
            if (err) return cb && cb(err);
            (typeof(cb) == "function") && cb(error, resp);
        });
    };
            
    api.login = function(email, password, cb)
    {
        api.request("login", { email: email, password: password }, function(err, resp)
        {
            if (err || !resp) return cb(err || "Unknown login error");
            
            (typeof(api.onlogin) == "function") && api.onlogin(resp.user);
            api.user = resp.user;
            api.user.authKey = resp.authKey;
            save(api.user);
            (typeof(api.options.onUserUpdate) == "function") && api.options.onUserUpdate();
            cb(null, { user: resp.user });
        });
    };
    api.register = function(user, cb)
    {
        api.request("register", user, function(err, resp)
        {
            if (err || !resp) return cb(err || "Unknown register error");
                
            api.user = resp.user;
            api.user.authKey = resp.authKey;
            save(api.user);
            (typeof(api.options.onUserUpdate) == "function") && api.options.onUserUpdate();
            cb(null, { user: resp.user });				
        });
    };
    api.logout = function(cb)
    {
        save(api.user = null);
        api.request("logout", { }, cb);
    }


    /* Every time we modify api.user locally, this has to be called to sync 
     * */
    api.updateUser = function()
    {
        api.user.lastModified = Date.now();
        api.request("saveUser", api.user);
        save(api.user);
    };

    api.pullUser = function(args)
    {
        if (! api.user) return;
        
        var authKey = api.user.authKey;
        api.request("getUser", _.extend({ }, args || { }, { authKey: authKey }), function(err, remoteUser)
        {
            if (! api.user) return;
             
            api.connected = err ? false : true;

            if (! remoteUser)
                return console.error(err || "Unknown error while retrieving user");

            if (_.isEqual(remoteUser, api.user))
                return;
            
            api.user = remoteUser;
            api.user.authKey = authKey;
            save(api.user);
            (typeof(api.options.onUserUpdate) == "function") && api.options.onUserUpdate();
        });
    };
};
module.exports = LinvoAPI;
