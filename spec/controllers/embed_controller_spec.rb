# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmbedController do
  describe 'GET embed' do
    it 'has a 400 status code without url params' do
      get :get
      expect(response).to have_http_status(:bad_request)
    end

    it 'has a 400 status when a Purl that is not embeddable is requested' do
      get :get, params: { url: 'http://purl.stanford.edu/tz959sb6952' }
      expect(response).to have_http_status(:bad_request)
    end

    it 'has a 404 status code without matched url scheme params' do
      get :get, params: { url: 'http://www.example.com' }
      expect(response).to have_http_status(:not_found)
    end

    it 'has a 404 status code without a druid in the URL' do
      get :get, params: { url: 'http://purl.stanford.edu/' }
      expect(response).to have_http_status(:not_found)
    end

    it 'has a 404 status for a Purl object that does not exists' do
      get :get, params: { url: 'http://purl.stanford.edu/abc123notanobject' }
      expect(response).to have_http_status(:not_found)
    end

    it 'has a 415 status code for an invalid format' do
      get :get, params: { url: 'http://purl.stanford.edu/abc123', format: 'yml' }
      expect(response).to have_http_status(:unsupported_media_type)
    end

    it 'has a 200 status code for a matched url scheme param' do
      get :get, params: { url: 'http://purl.stanford.edu/fn662rv4961' }
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET iframe' do
    it 'has a 400 status code without url params' do
      get :iframe
      expect(response).to have_http_status(:bad_request)
    end

    it 'has a 404 status code without matched url scheme params' do
      get :iframe, params: { url: 'http://www.example.com' }
      expect(response).to have_http_status(:not_found)
    end

    it 'has a 404 status code without a druid in the URL' do
      get :iframe, params: { url: 'http://purl.stanford.edu/' }
      expect(response).to have_http_status(:not_found)
    end

    it 'has a 404 status for a Purl object that does not exists' do
      get :iframe, params: { url: 'http://purl.stanford.edu/abc123notanobject' }
      expect(response).to have_http_status(:not_found)
    end

    it 'has a 415 status code for an invalid format' do
      get :iframe, params: { url: 'http://purl.stanford.edu/abc123', format: 'yml' }
      expect(response).to have_http_status(:unsupported_media_type)
    end

    it 'does not have an X-Frame-Options in the headers (so embedding in an iframe is allowed)' do
      get :iframe, params: { url: 'http://purl.stanford.edu/fn662rv4961' }
      expect(response.headers['X-Frame-Options']).to be_nil
    end

    it 'returns HTML' do
      get :iframe, params: { url: 'http://purl.stanford.edu/fn662rv4961' }
      expect(response).to have_http_status(:ok)
    end
  end
end
