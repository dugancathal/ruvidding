require 'ruvidding/app'
require 'faye'
Faye::WebSocket.load_adapter('thin')

map '/faye' do
  faye = Faye::RackAdapter.new(:mount => '/faye', :timeout => 25)
  run faye
end

map '/' do
  run Ruvidding::App
end
