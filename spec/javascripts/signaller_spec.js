describe('Signaller', function () {
  var FakeFaye;
  beforeEach(function () {
    var subscription = {
      then: jasmine.createSpy('subscriptionSpy')
    }

    FakeFaye = {
      Client: function () {
        return {
          subscribe: function () { return subscription; }
        }
      }
    };

    window.Faye = FakeFaye;
  });

  describe('new', function () {
    var signaller;
    beforeEach(function () {
      spyOn(FakeFaye, 'Client').and.callThrough();
      signaller = new Signaller('/faye/url');
    });

    it('creates a faye client with the faye URL', function () {
      expect(FakeFaye.Client).toHaveBeenCalledWith('/faye/url');
    });
  });

  describe('getRoomName', function () {
    var signaller;
    beforeEach(function () {
      signaller = new Signaller();
      spyOn(signaller, 'getPathname').and.returnValue('/testing/testing/ImJustSuggesting');
    });

    it('returns the last pathname part', function () {
      expect(signaller.getRoomName()).toEqual('ImJustSuggesting');
    });
  });
});
