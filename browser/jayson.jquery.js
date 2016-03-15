;(function($, undefined) {

  /**
   *  Constructor for a Jayson Jquery Client
   *  @class Jayson JSON-RPC Jquery Client
   *  @name JqueryClient
   *  @param {Object} options Settings for the ajax request
   *  @return {JqueryClient} 
   *  @api public
   */
  var JqueryClient = function(options) {
    if(!(this instanceof JqueryClient)) return new JqueryClient(options);

    var defaults = {
      dataType: 'json',
      type: 'POST', method: 'POST',
      generator: generateId,
      headers: { 'Content-Type': 'application/json' }
    };

    this.options = $.extend(defaults, options || {});
  };
   
  window.Jayson = JqueryClient;

  /**
   *  Sends a request to the server
   *  @see Utils.request
   *  @return {void}
   *  @api public
   */
  JqueryClient.prototype.request = function(method, params, id, callback) {
    if(typeof(id) === 'function') {
      callback = id;
      id = undefined; // specifically undefined because "null" is a notification request
    }

    // wrap around the error and success callbacks for post-processing
    var options = $.extend({}, this.options);
    try {
      var request = generateRequest(method, params, id);
      options.data = JSON.stringify(request);
    } catch(error) {
      return callback(error);
    }
    
    fetch(options.url, { method: "POST", body: options.data, headers: options.headers })
    .then(function(resp) { return resp.json() })
    .then(function(body) { callback(null, body.error, body.result) })
    .catch(function(err) { callback(err) })
  };

  /**
   * Generates a JSON-RPC 2.0 request
   * @see Utils.request
   */
  function generateRequest(method, params, id, options) {
    if($.type(method) !== 'string') {
      throw new TypeError(method + ' must be a string');
    }

    if(!params || !$.isPlainObject(params) && !$.isArray(params)) {
      throw new TypeError(params + ' must be an object or an array');
    }

    options = options || {};

    var request = {
      jsonrpc: "2.0",
      params: params,
      method: method
    };

    // if id was left out, generate one (null means explicit notification)
    if($.type(id) === 'undefined') {
      var generator = typeof(options.generator) === 'function' ? options.generator : generateId;
      request.id = generator(request);
    } else {
      request.id = id;
    }
    
    return request;
  }

  /**
   * Generates a request ID
   * @see Utils.generateId
   */
  function generateId() {
    return Math.round(Math.random() * Math.pow(2, 24));
  }

  // Expose the client via AMD if available
  if(typeof(define) === 'function') {
    define('jayson', [], function() {
      return JqueryClient;
    });
  }
})(jQuery);
