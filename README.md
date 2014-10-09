# SUL-Embed

An [oEmbed](http://oembed.com/) provider for embedding resources from the Stanford University Library.

## Development/Test Sandbox

There is an embedded static page available at `/pages/sandbox` in your development and test environments. Make sure that you use the same host on the service input (first text field) as you are accessing the site from (e.g. localhost or 127.0.0.1).

## oEmbed specification details

URL scheme: `http://purl.stanford.edu/*`

API endpoint: `TBD`

Example: `TBD?url=http://purl.stanford.edu/zw200wd8767&format=json`

## Creating Viewers

You can create a viewer by implementing a class with a pretty simple API.

The viewer class will be instantiated with an Embed::Request object.

    module Embed
      class DemoViewer
        def initialize(request)
          @request = request
        end
      end
    end

The class must implement a `#to_html` method which will be called on the instance of the viewer class. The results of this method will be returned as the HTML of the oEmbed response object.

    module Embed
      class DemoViewer
        def initialize(request)
          @request = request
        end
        def to_html
          "<h1>#{@request.purl_object.title}</h1>"
        end
      end
    end


The class must define a class method returning an array of which types it will support.  These types are derived from the type attribute from the contentMetadata.

    module Embed
      class DemoViewer
        def initialize(request)
          @request = request
        end
        def to_html
          "<h1>#{@request.purl_object.title}</h1>"
        end
        def self.supported_types
          [:demo_type]
        end
      end
    end


The file that the class is defined in (or your preferred method) should register itself as a view with the Embed module.

    module Embed
      class DemoViewer
        def initialize(request)
          @request = request
        end
        def to_html
          "<h1>#{@request.purl_object.title}</h1>"
        end
        def self.supported_types
          [:demo_type]
        end
      end
    end

    Embed.register_viewer(Embed::DemoViewer) if Embed.respond_to?(:register_viewer)

Last step is to include your viewer module in Embed::Viewer class

    require 'embed/viewer/demo_viewer'

### Console Example

    $ viewer = Embed.registered_viewers.first
    => Embed::DemoViewer
    $ request = Embed::Request.new({url: 'http://purl.stanford.edu/bb112fp0199'})
    => #<Embed::Request>
    $ viewer.new(request).to_html
    => "<h1>Writings - \"How to Test a Good Trumpet,\" The Instrumentalist 31(8):57-58 (reprint, 2 pp.)</h1>"
