import { Controller } from "@hotwired/stimulus"
import videojs from 'video.js';
import validator from '../modules/validator.js'
import mediaTagTokenWriter from '../modules/media_tag_token_writer.js'
import buildThumbnail from '../modules/media_thumbnail_builder.js'

export default class extends Controller {
  static targets = [ "mediaTag", "list"]

  connect() {
    this.setupThumbnails()
    const validators = this.mediaTagTargets
      .map((mediaTag) => validator(mediaTag.dataset.authUrl, mediaTagTokenWriter(mediaTag)))
    Promise.all(validators).then((values) => {
      values.forEach((data) => this.afterValidate(data))
    }).catch((err) => console.error(err))
  }

  afterValidate(data) {
    // TODO: handle stanford_restricted auth link
    // TODO: handle is restricted
    if(data.status === 'success') {
      this.initializeVideoJSPlayer()
    }
  }

  initializeVideoJSPlayer() {
    this.mediaTagTargets.forEach((mediaTag) => {
      mediaTag.classList.add('video-js', 'vjs-default-skin')
      videojs(mediaTag.id).removeChild('textTrackSettings')
    })
  }

  setupThumbnails() {
    const thumbnails = [...this.element.querySelectorAll('[data-slider-object]')].map((mediaDiv, index) => {
      const isAudio = mediaDiv.querySelector('audio, video')?.tagName === 'AUDIO'
      return buildThumbnail(mediaDiv.dataset, index, isAudio)
    });
    this.listTarget.innerHTML = thumbnails.join('')
  }
}