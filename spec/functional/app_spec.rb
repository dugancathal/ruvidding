require 'functional_spec_helper'
require 'ruvidding/app'

RSpec.describe Ruvidding::App do
  include Rack::Test::Methods
  def app
    Ruvidding::App
  end

  describe '/' do
    it 'has an element for the local-video' do
      get '/'
      expect(last_response.body).to match(/<div id='local-video'>/)
    end
  end
end
