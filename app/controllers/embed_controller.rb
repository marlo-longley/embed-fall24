# frozen_string_literal: true

class EmbedController < ApplicationController
  append_view_path Rails.root.join('app/views/embed')
  before_action :embed_request
  before_action :set_cache
  before_action :allow_iframe, only: %i[iiif iframe]

  def get
    @embed_request.validate!

    if @embed_request.format.to_sym == :xml
      render xml: Embed::Response.new(@embed_request).embed_hash.to_xml(root: 'oembed')
    else
      render json: Embed::Response.new(@embed_request).embed_hash
    end
  end

  def iframe
    # Trigger purl object validation (will raise Embed::Purl::ResourceNotAvailable)
    @embed_request.validate!
    @embed_request.purl_object.valid?
    @embed_response = Embed::Response.new(@embed_request)
    render 'iframe'
  end

  # Given a url to a manifest, render a mirador viewer.
  #  (e.g. /iiif?url=https://purl.stanford.edu/fr426cg9537/iiif/manifest)
  def iiif
    @embed_request.validate! url_scheme: false, format: false
  end

  def embed_request
    @embed_request ||= Embed::Request.new(params, self)
  end

  rescue_from Embed::Request::NoURLProvided do |e|
    render body: e.to_s, status: :bad_request
  end

  rescue_from Embed::Purl::ResourceNotEmbeddable do |e|
    render body: e.to_s, status: :bad_request
  end

  rescue_from Embed::Request::InvalidURLScheme do |e|
    render body: e.to_s, status: :not_found
  end

  rescue_from Embed::Purl::ResourceNotAvailable do |e|
    render body: e.to_s, status: :not_found
  end

  rescue_from Embed::Request::InvalidFormat do |e|
    render body: e.to_s, status: :unsupported_media_type
  end

  private

  def set_cache
    return unless Rails.env.production?

    request.session_options[:skip] = true
    response.headers['Cache-Control'] = "public, max-age=#{Settings.cache_life}"
  end

  def allow_iframe
    response.headers.delete('X-Frame-Options')
  end
end
