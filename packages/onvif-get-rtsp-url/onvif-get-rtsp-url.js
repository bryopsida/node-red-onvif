module.exports = function (RED) {
  'use strict'

  class OnvifGetRtspUrl {
    constructor (n) {
      RED.nodes.createNode(this, n)
    }
  }
  RED.nodes.registerType('get rtsp url', OnvifGetRtspUrl)
}
