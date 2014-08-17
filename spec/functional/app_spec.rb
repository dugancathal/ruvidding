require 'functional_spec_helper'
require 'ruvidding/app'

RSpec.describe Ruvidding::App do
  include Rack::Test::Methods
  def app
    Ruvidding::App
  end

  describe 'GET /' do
    it 'has an element for the local-video' do
      get '/'
      expect(last_response.body).to match(/<div id='local-video'>/)
    end
  end

  describe 'POST /start' do
    it 'expects a vid-name param' do
      post '/start'
      expect(last_response.status).to eq(400)
    end

    it 'redirects to /vids/:vid-name' do
      post '/start', 'vid-name' => 'mangy-baboon'
      follow_redirect!
      expect(last_request.path).to eq '/vids/mangy-baboon'
    end
  end

  describe 'GET /vids/:vid-name' do
    it 'has an element for the local-video, too' do
      get '/vids/testing'
      expect(last_response.body).to match(/<div id='local-video'>/)
    end

    it 'displays the vid name' do
      get '/vids/testing'
      expect(last_response.body).to match(/testing/)
    end
  end
end
