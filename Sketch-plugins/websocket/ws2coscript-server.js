#!/usr/bin/env node

if (!process.argv[2]) {
  console.error('Please add the Sketch version you work with like "Sketch3".');
  process.exit(1);
}

var ws = require("nodejs-websocket"),
  spawn = require('child_process').spawn,
  connection = null,
  port = 9912,
  sketchVersion = process.argv[2], // 'Sketch3Beta'
  osascriptPattern = /\[sketch:osascript\]\s*/,
  coscriptPattern = /\[sketch:coscript\]\s*/,
  coscriptCliCommand = '[[[COScript app:"' + sketchVersion +
    '"] delegate] runPluginAtURL:[NSURL fileURLWithPath:"{{path}}"]]';

// Set up the WebSocket server to listen on the given port.
// Any WebSocket can connect on the given port.
var server = ws.createServer(function(conn) {
  // Log new connection
  connection = conn;
  console.log("New connection.");
  conn.on("text", function(msg) {
    // If the rescieved message starts with the trigger '[coscript]'
    // followed by the script name, the run_coscript method
    // is called with the path argument.
    // Else the message is logged to the console.
    if (msg.indexOf('[sketch:coscript]') !== -1) {
      console.log(msg);
      run_coscript(msg.replace(coscriptPattern, ''));
    } else if (msg.indexOf('[sketch:osascript]') !== -1) {
      console.log(msg);
      run_osascript(msg.replace(osascriptPattern, ''));
    } else {
      console.log("Sent message is no coscript call: " + msg);
    }
  });
  // Log connection close.
  conn.on("close", function(code, reason) {
    console.log("Connection closed.");
  });
}).listen(port);

// Run the CocoaScript file defined in 'path'.
// Through the node 'spawn' method another process can be run.
// Run the script in Sketch
var run_coscript = function (path) {
  var sketchCall = coscriptCliCommand.replace('{{path}}', path);
    coscript = spawn('vendor/coscript', ['-e', sketchCall]);

  coscript.stdout.setEncoding('utf8');

  // Log the result and send "Done" when the process returns data.
  coscript.stdout.on('data', function(data) {
    console.log(data);
    connection.sendText(data);
  });
};

// Run the AppleScript file defined in 'path'.
// Through the node 'spawn' method another process can be run.
// Run the script in Sketch
var run_osascript = function (path) {
  var osacript = spawn('osascript', [path]);

  osacript.stdout.setEncoding('utf8');

  // Log the result and send "Done" when the process returns data.
  osacript.stdout.on('data', function(data) {
    console.log(data);
    connection.sendText('Done.');
  });

  // Logand send  the result when the process returns errors.
  osacript.stderr.on('data', function(data) {
    console.log(data);
    connection.sendText(data);
  });
};

console.log('Websocket server started on port ' + port +
  '\nPlease let it run.' +
  '\nYou can stop the websocket server with the key combination ^C.');
