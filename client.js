var jayson = require("jayson"),
    fs = require("fs"),
    path = require("path"),
    equals = require("equals"),
    extend = require("extend");

/* Prep: user storage; the Linvo account is tied to your system account
 */
LinvoAPI.storePath = path.join(process.env.APPDATA || process.env.HOME, ".linvo-user");
function loadUser()
{
    try {
        return JSON.parse(fs.readFileSync(LinvoAPI.storePath));
    } catch(e) { };
}
function saveUser(user)
{
    fs.writeFile(LinvoAPI.storePath, JSON.stringify(user));
}
    
/* Linvo API
 */
function LinvoAPI(options)
{
    this.options = extend({ host: "api.linvo.me", port: 80 }, options || {});
    this.user = loadUser();
    this.connected = true;
    
    var api = this,
        client = api.options.client || jayson.client.http({ host: api.options.host, port: api.options.port, path: "/rpc" });
    
    // TODO: watch storePath, update on change
    
    process.nextTick(function()
    {
        /* Initialize
         */
        if (!api.user && typeof(api.options.authenticate) == "function")
            api.options.authenticate();
        
        var authKey = api.user && api.user.authKey;
        api.user && client.request("getUser", [ { authKey: authKey } ], function(err, error, remoteUser)
        {
            api.connected = !err;
            if (err) // We shouldn't reset the auth upon a network error
                return console.error("LinvoAPI network error", err);                
            
            // We don't have a valid session: flush the user object and call authenticate
            if (! (remoteUser && remoteUser.email))
            {
                saveUser(api.user = null);
                (typeof(api.options.authenticate) == "function") && api.options.authenticate();
                return;
            }
            
            var currentUser = api.user || {};
            
            if (remoteUser.lastModified < currentUser.lastModified) // local user is newer than the remote one
                api.request("saveUser", api.user);
            else // remote user is newer
                api.user = remoteUser;
            
            api.user.authKey = authKey;
            saveUser(api.user);
        });
    });

    api.request = function(method, args, cb)
    {
        client.request(method, [ extend(true, { authKey: api.user && api.user.authKey }, args) ], function(err, error, resp)
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
            saveUser(api.user);
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
            saveUser(api.user);
            cb(null, { user: resp.user });				
        });
    };
    api.logout = function(cb)
    {
        saveUser(api.user = null);
        api.request("logout", { }, cb);
    }


    /* Every time we modify api.user locally, this has to be called to sync 
     * */
    api.updateUser = function()
    {
        api.user.lastModified = Date.now();
        api.request("saveUser", api.user);
        saveUser(api.user);
    };

    api.pullUser = function()
    {
        if (! api.user) return;
        
        var authKey = api.user.authKey;
        api.request("getUser", { authKey: authKey }, function(err, remoteUser)
        {
            api.connected = !err;

            if (! remoteUser)
                return console.error(err || "Unknown error while retrieving user");

            if (equals(remoteUser, api.user))
                return;
            
            api.user = remoteUser;
            api.user.authKey = authKey;
            saveUser(api.user);
            (typeof(api.options.onUserUpdate) == "function") && api.options.onUserUpdate();
        });
    };
    
    /* Periodically check for remote updates on the user 
     * */
    setInterval(function() { api.pullUser() }, 10*1000);
};
module.exports = LinvoAPI;
