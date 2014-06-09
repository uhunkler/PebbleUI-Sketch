---
title: The WebSocket Server
subtitle: Make buttons on the "pebble-dialogue" in the WebView work.
level: ../
page: p2
---

# The WebSocket Server

## Some background
Sketch plugins don't run continuously. When a Sketch plugin is started it **can** execute JavaScript functions in a dialogue in a WebView and **can** work with the values it retrieves from the dialogue. But it **can't** react on button clicks in the dialogue.

## Make the dialogue interactive with buttons
To get buttons in the dialogue trigger actions the click event must start a Sketch CocoasScript. "**WebSocket** is a protocol providing full-duplex communications channels over a single TCP connection." ([WebSocket Wikipedia.org](http://en.wikipedia.org/wiki/Websocket)) Which means a web page can establish a consistent communication channel with a server. 

The dialogue in the WebView in Sketch is a web page and therefore can communicate with a WebSocket server running on the same computer as Sketch. Such a simple WebSocket server based on Node.js is added to the package. When the server runs the dialogue connects to that WebSocket server. Only when the connection is established the buttons are shown in the dialogue. Without a WebSocket connection no buttons are visible and the scripts need to be called from the Sketch plugin menu.

A message is sent from the dialogue via the WebSocket to the WebSocket server when a button is clicked. The WebSocket server calls the Sketch CocoaScript which is connected to the message. The Sketch script runs as if it would have been called from the plugin menu. The WebSocket server establishes a "back channel" between the dialogue and Sketch to trigger prepared CocoaScripts.

## How to start the Node.js WebSocket server
The server is started via a command line command and keeps running until it is canceled on the command line. To make it easy to start the server the Sketch plugin menu "Plugins > websocket > webservice-starting-information" shows the CLI command and writes it into the computer pastebin from where it can be pasted into the terminal window.

The steps to start the WebSocket server are: 
* open a terminal
* run the Sketch menu item
* paste the CLI command into the terminal window
* hit return

The WebSocket server will be started and the dialogue will show the buttons when opened. If the dialogue has been opened without the WebSocket server running the dialogue can be reloaded to show the buttons after the WebSocket server has been started. The server will log all traffic to the command line.

## How to install the WebSocket server
First download the [PebbleUI-Sketch](https://github.com/uhunkler/PebbleUI-Sketch) repository from GitHub and copy the "websocket" folder from the repository folder "Sketch-plugins" into the Sketch plugins folder on the computer. To open the Sketch plugins folder on the computer use the Sketch  menu "Plugins > Reveal plugins folder...".

The WebSocket server is based on Node.js. Node.js must be installed on the local computer. If Node.js is not installed the recommended way to install Node.js is to download it from the [Node.js website](http://nodejs.org) and run the installer.

When Node.js is installed the "nodejs-websocket" module needs to be downloaded - it is not included in the Sketch "websocket" plugin folder. The "nodejs-websocket" module will be installed with the terminal. Open the terminal, change directory into the "websocket" plugin folder and type the command "npm install". That's all - the Node Package Manager will download the module and place it into the "node_modules" folder.

When the module is installed the WebSocket server can be started. ([See above](#how-to-start-the-node-js-websocket-server)).