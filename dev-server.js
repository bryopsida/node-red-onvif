const http = require('http')
const express = require('express')
const RED = require('node-red')
const path = require('path')

// Create an Express app
const app = express()

// Add a simple route for static content served from 'public'
app.use('/', express.static('public'))

// Create a server
const server = http.createServer(app)

// Create the settings object - see default settings.js file for other options
const settings = {
  httpAdminRoot: '/red',
  httpNodeRoot: '/api',
  userDir: path.join(__dirname, 'node-red-data'),
  functionGlobalContext: { }, // enables global context
  editorTheme: {
    page: {
        title: "Dev Server",
    },
    header: {
        title: "Dev Server",
    },
    theme: 'dracula'
  },
  nodesDir: path.join(__dirname, 'packages')
}

// Initialise the runtime with a server and settings
RED.init(server, settings)

// Serve the editor UI from /red
app.use(settings.httpAdminRoot, RED.httpAdmin)

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot, RED.httpNode)

server.listen(8000)

// Start the runtime
RED.start()

process.on('SIGINT', function () {
  console.log('Shutting down...')
  RED.stop().then(function () {
    process.exit()
  })
})
