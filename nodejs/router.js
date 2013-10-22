var url = require('url');
var util = require('util');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');
var config = require('./config.js');
var fileServer = require('./fileServer.js');
var version;

/**
 * 从文件读取静态文件版本号
 * @return {String} 版本号
 */
function readStaticFileVersion() {
  var file = path.resolve(__dirname, '../static/version.json');
  var version = fs.readFileSync(file, 'utf-8');
  return version;
}

function compile(req, res) {

  var pathname,
      reqUrl,
      templatePath,
      template,
      html,
      stateCode = 200;

  reqUrl = url.parse(req.url);
  pathname = reqUrl.pathname.replace(/^\//,'');
  pathname = pathname.replace(/\/$/, '');

  switch (pathname) {
    case '':
    case 'index':
    case 'home':
      pathname = 'index';
      templatePath = 'index.html';
      break;
    default :
      templatePath = pathname + '.html';
  }

  templatePath = path.resolve(__dirname, '../template/' + templatePath);

  try {
    template = fs.readFileSync(templatePath, 'utf-8');
    ejs.clearCache();
    html = ejs.render(template, {
      VERSION: version,
      filename: templatePath,
      pageName: pathname
    });
  } catch(e) {
    stateCode = 404;
    html = stateCode + ': Page Not Found! path:'+ templatePath;
  }

  res.writeHead(stateCode, {
    "Content-Type": "text/html",
    "Content-Length": html.length
  });
  res.end(html);
}

exports.direct = function(req, res) {
  var reqUrl = url.parse(req.url).pathname;

  version = readStaticFileVersion();
  if (reqUrl.match(/^\/static/)) {
    fileServer.write(req, res, version);
  } else {
    compile(req, res);
  }
};