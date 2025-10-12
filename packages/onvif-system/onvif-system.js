module.exports = function (RED) {
  'use strict'
  const onvif = require('onvif')

  class OnvifCredentials {
    #username
    #password

    get username () {
      return this.#username
    }

    set username (value) {
      this.#username = value
    }

    get password () {
      return this.#password
    }

    set password (value) {
      this.#password = value
    }
  }

  /**
   * Configuration node for ONVIF system settings.
   * @class
   * @extends EventEmitter
   */
  class OnvifSystemConfigNode {
    #autoConnect
    #hostname
    #path
    #port
    #preserveAddress
    #skipTlsVerify
    #timeout
    #useSoapSecurityHeader
    #useTls
    #onvif
    #credentials = new OnvifCredentials()

    constructor (n) {
      RED.nodes.createNode(this, n)
      this.#autoConnect = n.autoConnect
      this.#hostname = n.hostname
      this.#path = n.path
      this.#port = n.port
      this.#preserveAddress = n.preserveAddress
      this.#skipTlsVerify = n.skipTlsVerify
      this.#timeout = n.timeout
      this.#useSoapSecurityHeader = n.useSoapSecurityHeader
      this.#useTls = n.useTls
      this.#onvif = new onvif.Cam({
        hostname: this.#hostname,
        username: this.credentials.username,
        password: this.credentials.password,
        port: this.#port,
        path: this.#path,
        preserveAddress: this.#preserveAddress,
        skipTlsVerify: this.#skipTlsVerify,
        timeout: this.#timeout,
        useSoapSecurity: this.#useSoapSecurityHeader,
        useTls: this.#useTls
      })
    }

    set credentials (value) {
      // onvif re-assigns the whole credentials object
      // I don't want that, pluck the properties to keep the underlying object const
      this.#credentials.username = value.username
      this.#credentials.password = value.password
    }

    get credentials () {
      return this.#credentials
    }

    get onvif () {
      return this.#onvif
    }

    get autoConnect () {
      return this.#autoConnect
    }

    set autoConnect (value) {
      this.#autoConnect = value
    }

    get hostname () {
      return this.#hostname
    }

    set hostname (value) {
      this.#hostname = value
    }

    get path () {
      return this.#path
    }

    set path (value) {
      this.#path = value
    }

    get port () {
      return this.#port
    }

    set port (value) {
      this.#port = value
    }

    get preserveAddress () {
      return this.#preserveAddress
    }

    set preserveAddress (value) {
      this.#preserveAddress = value
    }

    get skipTlsVerify () {
      return this.#skipTlsVerify
    }

    set skipTlsVerify (value) {
      this.#skipTlsVerify = value
    }

    get timeout () {
      return this.#timeout
    }

    set timeout (value) {
      this.#timeout = value
    }

    get useSoapSecurityHeader () {
      return this.#useSoapSecurityHeader
    }

    set useSoapSecurityHeader (value) {
      this.#useSoapSecurityHeader = value
    }

    get useTls () {
      return this.#useTls
    }

    set useTls (value) {
      this.#useTls = value
    }
  }

  RED.nodes.registerType('onvif-system', OnvifSystemConfigNode, {
    category: 'config',
    credentials: {
      username: { type: 'text' },
      password: { type: 'password' }
    }
  })
}
