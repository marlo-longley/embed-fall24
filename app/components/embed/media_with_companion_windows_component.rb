# frozen_string_literal: true

module Embed
  class MediaWithCompanionWindowsComponent < ViewComponent::Base
    def initialize(viewer:)
      @viewer = viewer
    end

    attr_reader :viewer

    delegate :purl_object, to: :viewer
    delegate :druid, :citation_only?, :manifest_json_url, :downloadable_files, to: :purl_object

    def include_transcripts
      Settings.enabled_features.transcripts || params[:transcripts] == 'true'
    end

    def primary_files_count
      resources_with_primary_file.count
    end

    def resources_with_primary_file
      @resources_with_primary_file ||= purl_object.contents.select do |purl_resource|
        purl_resource.primary_file.present?
      end
    end

    def many_primary_files
      primary_files_count > 1
    end
  end
end
