require 'sinatra/base'

module Ruvidding
  class App < Sinatra::Base
    get '/' do
      haml :index
    end
  end
end
