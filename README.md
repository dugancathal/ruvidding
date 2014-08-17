# ruvidding

An RTC app using Sinatra and Faye.

There are so many node.js-based RTC apps, I thought it was time for a little
something different.

## Installation

While technically, this is a gem, it's really only for organization. To install:

    ```bash
    # Clone the repo
    git clone https://github.com/dugancathal/ruvidding.git
    cd ruvidding

    # Install the dependencies
    bundle install

    # Run the specs
    rspec spec
    ```

## Usage

Boot the app.

    rackup -p "$PORT" -E production config.ru

## Contributing

1. Fork it ( https://github.com/dugancathal/ruvidding/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
