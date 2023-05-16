# frozen_string_literal: true

module Embed
  class Purl
    class ResourceFile
      def initialize(resource, file, rights)
        @resource = resource
        @file = file
        @rights = rights
        @index = nil
      end

      attr_accessor :index
      attr_reader :resource

      def label
        return resource.description if resource.description.present?

        title
      end

      def title
        @file.attributes['id'].try(:value)
      end

      def hierarchical_title
        title.split('/').last
      end

      def primary?
        primary_types = Settings.primary_mimetypes[resource.type] || []
        !thumbnail? && primary_types.include?(mimetype)
      end

      def thumbnail
        resource.files.find(&:thumbnail?)
      end

      def thumbnail?
        return true if resource.object_thumbnail?
        return false unless image?

        Settings.resource_types_that_contain_thumbnails.include?(resource.type)
      end

      def vtt
        resource.files.find(&:vtt?)
      end

      def vtt?
        mimetype == 'text/vtt' && title.end_with?('.vtt')
      end

      def pdf?
        mimetype == 'application/pdf'
      end

      def mimetype
        @file.attributes['mimetype'].try(:value)
      end

      def previewable?
        preview_types.include?(mimetype)
      end

      # unused (9/2016) - candidate for removal?
      def image?
        mimetype =~ %r{image/jp2}i
      end

      # @return [Integer]
      def size
        @file.attributes['size'].try(:value).to_i
      end

      # unused (9/2016) - candidate for removal?
      def height
        @file.xpath('./*/@height').first.try(:text) if @file.xpath('./*/@height').present?
      end

      # unused (9/2016) - candidate for removal?
      def width
        @file.xpath('./*/@width').first.try(:text) if @file.xpath('./*/@width').present?
      end

      def duration
        md = Embed::MediaDuration.new(@file.xpath('./*[@duration]').first) if @file.xpath('./*/@duration').present?
        md&.to_s
      end

      # unused (9/2016) - candidate for removal?
      def location
        @file.xpath('./location[@type="url"]').first.try(:text) if @file.xpath('./location[@type="url"]').present?
      end

      def stanford_only?
        value, _rule = @rights.stanford_only_rights_for_file(title)

        value
      end

      def location_restricted?
        @rights.restricted_by_location?(title)
      end

      def world_downloadable?
        @rights.world_downloadable_file?(@file.attributes['id'])
      end

      private

      def preview_types
        ['image/jp2']
      end
    end
  end
end
