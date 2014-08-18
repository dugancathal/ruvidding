describe('PeerConnector', function () {
  var connector, config;
  beforeEach(function () {
    connector = new PeerConnector();
    spyOn(window, 'RTCPeerConnection')
  });

  describe('create', function () {
    it('creates a PeerConnection with the given config', function () {
      config = {imma: 'config'};
      expectedConfig = $.extend({}, config, {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]});

      connection = connector.create(config);
      expect(window.RTCPeerConnection).toHaveBeenCalledWith(expectedConfig);
    });

    it('extracts the iceServerGenerator and uses that, if supplied', function () {
      var i = 0;
      config = {iceServerGenerator: function () { return [{url: 'turn:server' + ++i}]; }}

      connector.create(config);
      expect(window.RTCPeerConnection).toHaveBeenCalledWith({iceServers: [{url: 'turn:server1'}]});

      connector.create(config);
      expect(window.RTCPeerConnection).toHaveBeenCalledWith({iceServers: [{url: 'turn:server2'}]});
    });
  });
});
