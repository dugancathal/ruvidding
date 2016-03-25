require 'sinatra/base'
require 'httparty'
require 'json'

module Ruvidding
  class App < Sinatra::Base
    XIRSYS_URL='https://service.xirsys.com/ice'

    get '/' do
      haml :index
    end

    get '.well-known/acme-challenge/-vVHzl7iOwqRCr1ZvpgOTGMhXq4fp4XPEwTKrXoPH0k' do
      '-vVHzl7iOwqRCr1ZvpgOTGMhXq4fp4XPEwTKrXoPH0k.9FEjhUfQZlT6ilwUgvfEPAKZ6Rej-FyTGIlyqSdxRm0'
    end

    post '/start' do
      return status 400 unless params['vid-name']
      redirect to("/vids/#{params['vid-name']}")
    end

    get '/vids/:vid_name' do
      @vid_name = params['vid_name']
      haml :vid
    end

    get '/ice' do
      result = JSON.parse(
        HTTParty.get(XIRSYS_URL, query: {
          ident: ENV['XIRSYS_IDENT'],
          secret: ENV['XIRSYS_TOKEN'],
          domain: 'ruvidding.me',
          application: 'ruviddingme',
          room: 'ruviddingme',
          secure: 1
        }).body
      )
      p result
      content_type 'application/json'
      Array((result['d'] || {})['iceServers']).to_json
    end
  end
end
