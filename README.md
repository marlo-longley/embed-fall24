[![CI](https://github.com/sul-dlss/sul-embed/actions/workflows/ruby.yml/badge.svg)](https://github.com/sul-dlss/sul-embed/actions/workflows/ruby.yml)

# SUL-Embed

An [oEmbed](http://oembed.com/) provider for embedding resources from the Stanford University Library.

## Development/Test Sandbox

There is an embedded static page available at `/pages/sandbox` in your development and test environments. Make sure that you use the same host on the service input (first text field) as you are accessing the site from (e.g. localhost or 127.0.0.1).

To bring up a dev environment first you'll need to install Ruby and JavaScript dependencies. Note: NodeJS v18 and [yarn](https://yarnpkg.com/) must be installed:

    bundle install
    yarn install

Then start up the Rails app (web server, debugger, CSS bundler, JS bundler) in one terminal window:

    bin/dev

To debug, add one or more `debugger` statements to Ruby source code and then attach the debug client:

    bin/rdbg -A

Now visit this URL in your browser!

    http://localhost:3000/pages/sandbox

**NOTE**: If you're doing development on the media player, the above link may get you little more than CORS errors, in which case you likely want to develop against ViewComponent previews:

    http://localhost:3000/rails/view_components/
    
When developing viewers it can sometimes be helpful to load items using files served from the local development server instead of deployed PURL and Stacks servers. To do this you will want to create a `config/settings.local.yml` file with the following contents:

```yaml
purl_url: 'http://localhost:3000/'
stacks_url: 'http://localhost:3000/'
```

Then you will need to place the "public XML" metadata for an object in the `public` directory `public/{druid}.xml` and the items stacks files in a directory `public/file/druid:{druid}`. For example, for a druid `bk914zc7842` you would have a `public` directory structure that looks something like:

```
public
├── bk914zc7842.xml
└── file
    └── druid:bk914zc7842
        ├── bk914zc7842_low.glb
        ├── bk914zc7842_low.mtl
        ├── bk914zc7842_low.obj
        └── bk914zc7842_normal_low.jpg
```

# Notes for developers

## oEmbed specification details

URL scheme: `https://purl.stanford.edu/*`

API endpoint: `https://embed.stanford.edu`

Example: `https://embed.stanford.edu/embed.json?url=http://purl.stanford.edu/zw200wd8767`


### Linking in viewers

The rich HTML payload that is supplied via the oEmbed API is an iframe. This means that all consumers will be embedding an iframe into their page. Given this fact, generating links will require explicit targets if they are not intended to internally replace embed content.  Given this, there are two patterns that can be used.  For links intended to download files, a `target="_blank"` can be used (effectively opening a new tab for the download which is immediately closed).  When using `target="_blank"` add `rel="noopener noreferrer"` **particularly** when linking externally (although this should be reserved for linking to internal resources when possible). See [this blog post](https://www.jitbit.com/alexblog/256-targetblank---the-most-underestimated-vulnerability-ever/) for an explanation. *Note: This does not apply to WebAuth links.*

For links that are intended to navigate the users browser away from the current page (e.g. the links to Memento/GeoBlacklight/etc.) then `target="_parent"` should be used to give the link the default browser behavior. [More about link targets](http://www.w3schools.com/tags/att_a_target.asp).

### Console Example

    $ viewer = Embed.registered_viewers.first
    => Embed::DemoViewer
    $ request = Embed::Request.new({url: 'http://purl.stanford.edu/bb112fp0199'})
    => #<Embed::Request>
    $ viewer.new(request)
    => # your viewer instance


### Customizing the Embed Panel

Viewers can customize the embed panel.  To do this, create a template in `app/views/embed/embed-this`, to provide the HTML for the embed panel.

See File viewers for an example.


### Adding a Download Panel
Viewers can add their own download panel.  To do this, create a component in `app/components/embed/download`, to provide the HTML for the download panel.

In order to enable the download panel you need to provide a method in your viewer class.  This method lets the footer logic know that the viewer will provide a download panel and it should render the Download button.

    def show_download?
      true
    end
