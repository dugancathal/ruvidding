describe('Signaller', function () {
  var FakeFaye, fakeClient, signaller, subscription;
  beforeEach(function () {
    subscription = {
      then: jasmine.createSpy('subscriptionSpy')
    }

    fakeClient = {
      subscribe: function () { return subscription; },
      publish: jasmine.createSpy('publishSpy')
    };

    FakeFaye = {
      Client: function () {
        return fakeClient;
      }
    };

    window.Faye = FakeFaye;

    signaller = new Signaller('/faye/url');
    spyOn(signaller, 'getPathname').and.returnValue('/testing/testing/ImJustSuggesting');
  });

  describe('new', function () {
    beforeEach(function () {
      spyOn(FakeFaye, 'Client').and.callThrough();
      signaller = new Signaller('/faye/url');
    });

    it('creates a faye client with the faye URL', function () {
      expect(FakeFaye.Client).toHaveBeenCalledWith('/faye/url');
    });
  });

  describe('getRoomName', function () {
    it('returns the last pathname part', function () {
      expect(signaller.getRoomName()).toEqual('/ImJustSuggesting');
    });
  });

  describe('sendToRoom', function () {
    it('publishes to the signaller room', function () {
      signaller.sendToRoom('imma message');
      expect(fakeClient.publish).toHaveBeenCalledWith('/ImJustSuggesting', 'imma message');
    });
  });

  describe('onMessage', function () {
    describe('an unknown message type', function () {
      it('explodes', function () {
        try {
          signaller.onMessage({messageType: 'ImmaFraud'});
        } catch (e) {
          expect(e.message).toEqual('undefined is not a function');
        }
      });
    });

    describe('an IceCandidate message', function () {
      it('adds them to the PeerConnections', function () {
        signaller.connections = [{addIceCandidate: jasmine.createSpy('addIceSpy')}];

        var candidateBody = {messageType: 'IceCandidate', sdpMLineIndex: 3, candidate: 'text'};
        var iceCandidate = new RTCIceCandidate(candidateBody);
        signaller.onMessage(candidateBody);

        expect(signaller.connections[0].addIceCandidate).toHaveBeenCalledWith(iceCandidate);
      });
    });
  });
});
