require 'functional_spec_helper'
require 'ruvidding/app'

RSpec.describe Ruvidding::App do
  include Rack::Test::Methods
  def app
    Ruvidding::App
  end

  it 'renders the index template' do
    get '/'
    expect(last_response).to be_ok
  end
end
