var url = require('url');
var fs = require('fs');
var path = require('path');
var mime = require('./mime.js');
var config = require('./config.js');

exports.write = function(req, res, version) {

  var urlObj,
      file,
      ext,
      extType,
      realPath;

  urlObj = url.parse(req.url);
  file = urlObj.pathname;
  realPath = path.resolve(__dirname, '.././'+file);
  ext = path.extname(file);
  ext = ext ? ext.slice(1) : 'unknown';
  extType = mime.types[ext];

  path.exists(realPath, function(exists){
    if (!exists) {

      /**
       * not found
       */
      res.writeHead(404, {
        'Content-Type': 'text/plain'
      });
      res.end('404: File Not Found!<p>filepath: '+ file +'</p>');
    } else {

      fs.readFile(realPath, 'binary', function(err, file) {

        var lastMidified;
        var modifiedSince;
        var stat = fs.statSync(realPath);

        /**
         * Server Error
         */
        if (err) {
          res.writeHead(500, {
            'Content-Type': 'text/plain'
          });
          res.end(err);
        } else {

          /**
           * successfully
           */
          lastMidified = stat.mtime.toUTCString();
          modifiedSince = req.headers['if-modified-since'] || '';
          modifiedSince = modifiedSince.split('|||');

          //if (modifiedSince[0] && lastMidified == modifiedSince[0] && version==modifiedSince[1]) {
          if (modifiedSince[1] && version==modifiedSince[1]) {
            res.writeHead(304, 'Not Modified');
            res.end();
          } else {

            // expires time
            if (ext.match(config.expires.files)) {
              var expires = new Date();
              expires.setTime(expires.getTime() + config.expires.maxAge*1000);
              res.setHeader('Expires', expires.toUTCString());
              res.setHeader('Cache-Control', "max-age=" + config.expires.maxAge);
            }
            res.setHeader('Last-Modified', lastMidified + '|||' + version);
            res.writeHead(200, {'Content-Type': extType});
            res.write(file, 'binary');
            res.end();
          }
        }
      });
    }
  });


}