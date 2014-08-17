require 'sinatra/base'

module Ruvidding
  class App < Sinatra::Base
    get '/' do
      haml :index
    end

    post '/start' do
      return status 400 unless params['vid-name']
      redirect to("/vids/#{params['vid-name']}")
    end

    get '/vids/:vid_name' do
      @vid_name = params['vid_name']
      haml :vid
    end
  end
end
