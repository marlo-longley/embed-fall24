# frozen_string_literal: true

module Embed
  class CompanionWindowsComponent < ViewComponent::Base
    # @param [#purl_object] viewer
    # @param [String] stimulus_controller any extra stimulus controllers to initialize on the component.
    def initialize(viewer:, stimulus_controller: nil)
      @viewer = viewer
      @stimulus_controller = stimulus_controller
    end

    renders_one :header_button
    renders_one :body
    renders_one :dialog
    renders_one :drawer_button
    renders_one :drawer_content

    attr_reader :viewer

    delegate :purl_object, to: :viewer
    delegate :downloadable_files, :druid, to: :purl_object

    def iiif_v3_manifest_url
      "#{Settings.purl_url}/#{druid}/iiif3/manifest"
    end
  end
end
