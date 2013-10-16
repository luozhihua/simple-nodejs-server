var http = require("http");
var router = require("./nodejs/router");
var port = 8001;
var ip = '127.0.0.1';

// Create http server
http.createServer(function(req, res) {

  // redirect all requests to route control
  router.direct(req, res);

}).listen(port, ip);

console.log('Server is runing on '+ ip +': '+ port);