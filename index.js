import express from 'express'
import basicAuth from 'express-basic-auth'
import http from 'node:http'
import { createBareServer } from '@tomphttp/bare-server-node'
import path from 'node:path'
import cors from 'cors'
import config from './config.js'
const __dirname = process.cwd()
const server = http.createServer()
const app = express(server)
const bareServer = createBareServer('/v/')
const PORT = process.env.PORT || 8080
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static(path.join(nggurl, 'static')))
app.use('/', (req, res) => {
    console.log(`Incoming Requests: ${req.url}`);
    proxy.web(req, res);
  });


  const nggurl = 'https://educationbluesky.com';

  const proxy = httpProxy.createProxyServer({
    target: nggurl,
    changeOrigin: true,
  });

if (config.local !== false) {
  app.get('/y/*', (req, res, next) => {
    const baseUrl = 'https://raw.githubusercontent.com/ypxa/y/main'
    fetchData(req, res, next, baseUrl)
  })

  app.get('/f/*', (req, res, next) => {
    const baseUrl = 'https://raw.githubusercontent.com/4x-a/x/fixy'
    fetchData(req, res, next, baseUrl)
  })
}

if (cluster.isMaster) {
  console.log(`Slave ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Slave ${worker.process.pid} died`);
    cluster.fork();
  });
} 

const fetchData = async (req, res, next, baseUrl) => {
  try {
    const reqTarget = `${baseUrl}/${req.params[0]}`
    const asset = await fetch(reqTarget)

    if (asset.ok) {
      const data = await asset.arrayBuffer()
      res.end(Buffer.from(data))
    } else {
      next()
    }
  } catch (error) {
    console.error('Error fetching:', error)
    next(error)
  }
}
server.on('request', (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res)
  } else {
    app(req, res)
  }
})

server.on('upgrade', (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head)
  } else {
    socket.end()
  }
})

server.on('listening', () => {
  console.log(`Running at http://localhost:${PORT}`)
})

server.listen({
  port: PORT,
})
