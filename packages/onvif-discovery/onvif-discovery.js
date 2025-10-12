module.exports = function (RED) {
  'use strict'
  const onvif = require('onvif')

  class OnvifDiscovery {
    #discoveryIntervalSeconds
    #discoveryIntervalHandle
    #mode

    constructor (n) {
      RED.nodes.createNode(this, n)
      this.#mode = n.mode || 'timed'
      this.#discoveryIntervalSeconds = parseInt(n.discoveryInterval ?? '120')

      this.on('close', this.cleanup.bind(this))
      onvif.Discovery.on('error', this.onError.bind(this))

      if (this.#mode === 'timed') {
        this.#discoveryIntervalHandle = setInterval(this.probe.bind(this), this.#discoveryIntervalSeconds * 1000)
      }

      this.status({ fill: 'green', shape: 'ring', text: 'Created' })

      if (this.mode === 'timed') {
        this.probe()
      }

      if (this.#mode === 'triggered') {
        this.on('input', (msg, send, done) => {
          this.probe(msg, send, done)
        })
      }
    }

    get inputs () {
      return this.#mode === 'timed' ? 0 : 1
    }

    get mode () {
      return this.#mode
    }

    set mode (value) {
      if (value !== this.#mode) {
        if (this.#mode === 'timed') {
          clearInterval(this.#discoveryIntervalHandle)
          this.#discoveryIntervalHandle = null
        }
        if (value === 'timed') {
          this.#discoveryIntervalHandle = setInterval(this.probe.bind(this), this.#discoveryIntervalSeconds * 1000)
        }
        if (value === 'triggered') {
          this.on('input', (msg, send, done) => {
            this.probe(msg, send, done)
          })
        }
        this.#mode = value
      }
    }

    set discoveryIntervalSeconds (value) {
      this.#discoveryIntervalSeconds = value
      if (this.#discoveryIntervalHandle) {
        clearInterval(this.#discoveryIntervalHandle)
      }
      this.#discoveryIntervalHandle = setInterval(this.probe.bind(this), this.#discoveryIntervalSeconds * 1000)
    }

    get discoveryIntervalSeconds () {
      return this.#discoveryIntervalSeconds
    }

    cleanup () {
      if (this.#discoveryIntervalHandle) {
        clearInterval(this.#discoveryIntervalHandle)
        this.#discoveryIntervalHandle = null
      }
      onvif.Discovery.removeListener('error', this.onError.bind(this))
      this.status({ fill: 'red', shape: 'ring', text: 'Closed' })
    }

    onError (err, xml) {
      this.warn('ONVIF Discovery Error: ' + err.message)
      if (xml) {
        this.warn(xml)
      }
      this.status({ fill: 'yellow', shape: 'dot', text: 'Discovery Error' })
    }

    probe (_msg, send, done) {
      this.status({ fill: 'blue', shape: 'dot', text: 'Running' })
      onvif.Discovery.probe((err, cams) => {
        if (err) {
          this.onError(err)
          if (done) done(err)
          return
        }
        this.outputCams(cams, send)
        this.status({ fill: 'green', shape: 'dot', text: 'Finished' })
        if (done) done()
      })
    }

    outputCams (cams, sendFromInput) {
      this.log(`Discovered ${cams.length} ONVIF devices`)
      // emit cams individually
      cams.forEach((cam) => {
        const msg = {
          payload: {
            hostname: cam.hostname,
            port: cam.port,
            path: cam.path,
            xaddrs: cam.xaddrs,
            uri: cam.uri,
            services: cam.services,
            cam
          }
        }
        if (sendFromInput) {
          sendFromInput(msg)
        } else {
          this.send(msg)
        }
      })
    }
  }
  RED.nodes.registerType('discovery', OnvifDiscovery)
}
