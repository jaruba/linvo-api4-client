Linvo API Client
=================
This module will allow easy connection to the Linvo API server. It manages authentication on a system user level.


Basic usage
===========

```javascript
// import the module
var LinvoAPI = require("linvo-api4-client");

// create the instance; call the function without arguments to connect to the main Linvo server
var api = new LinvoAPI({ host: "localhost", port: 3008 });

// Setup the authentication callback; this is called if we haven't authenticated
api.options.authenticate = function()
{
    var EMAIL = "ivo@linvo.me", 
        PASSWORD = "test";

    // Call api.login to authenticate
    api.login(EMAIL, PASSWORD, function(err)
    {
        // on login; unless we have an err, it is successful
        if (!err) proceed();
    });
};

// At any moment, we can check api.user object to see if we have logged in
if (api.user) proceed();

// The upper code will call proceed() when we have logged in as a valid Linvo user
function proceed()  
{
    console.log("Linvo user", api.user);
    
    var meta = {"tvdb_id":79349,"name":"Dexter","episode":12,"season":8};
    api.request("cinematicRequest", { meta: meta }, function(err, resp)
    {
        console.log("cinematicQuery response", resp);
    });
}
```