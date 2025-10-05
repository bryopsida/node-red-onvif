module.exports = function (RED) {
  'use strict'
  const onvif = require('onvif')

  class OnvifDiscovery {
    #discoveryIntervalSeconds
    #discoveryIntervalHandle
    constructor (n) {
      RED.nodes.createNode(this, n)
      this.#discoveryIntervalSeconds = parseInt(n.discoveryInterval) || 120

      this.on('close', this.cleanup.bind(this))
      onvif.Discovery.on('error', this.onError.bind(this))
      this.#discoveryIntervalHandle = setInterval(this.probe.bind(this), this.#discoveryIntervalSeconds * 1000)
      this.status({ fill: 'green', shape: 'ring', text: 'Created' })
      this.probe()
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

    probe () {
      this.status({ fill: 'blue', shape: 'dot', text: 'Running' })
      onvif.Discovery.probe((err, cams) => {
        if (err) {
          this.onError(err)
          return
        }
        this.outputCams(cams)
        this.status({ fill: 'green', shape: 'dot', text: 'Finished' })
      })
    }

    outputCams (cams) {
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
        this.send(msg)
      })
    }
  }
  RED.nodes.registerType('discovery', OnvifDiscovery)
}
