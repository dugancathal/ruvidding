# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'ruvidding/version'

Gem::Specification.new do |spec|
  spec.name          = "ruvidding"
  spec.version       = Ruvidding::VERSION
  spec.authors       = ["TJ Taylor"]
  spec.email         = ["dugancathal@gmail.com"]
  spec.summary       = %q{RTC on Sinatra}
  spec.description   = %q{}
  spec.homepage      = ""
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0")
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_dependency 'sinatra', '~> 1.4.5'
  spec.add_dependency 'thin', '~> 1.6.2'
  spec.add_dependency 'faye', '~> 1.0.3'
  spec.add_dependency 'haml', '~> 4.0.5'

  spec.add_development_dependency "bundler", "~> 1.7"
  spec.add_development_dependency "rake", "~> 10.0"
  spec.add_development_dependency "rspec", "~> 3"
  spec.add_development_dependency "rack-test", "~> 0.6.2"
end
