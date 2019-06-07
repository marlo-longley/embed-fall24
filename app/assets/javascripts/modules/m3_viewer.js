import Mirador from 'mirador/dist/es/src/index.js';
import miradorShareDialogPlugin from 'mirador-share-plugin/es/MiradorShareDialog.js';
import miradorSharePlugin from 'mirador-share-plugin/es/miradorSharePlugin.js';

export default class M3Viewer {
  static init() {
    var $el = jQuery('#sul-embed-m3');
    var data = $el.data();
    Mirador.viewer({
      id: 'sul-embed-m3',
      miradorSharePlugin: {
        dragAndDropInfoLink: 'https://library.stanford.edu/projects/international-image-interoperability-framework/viewers',
        shareLink: {
          enabled: true,
          manifestIdReplacePattern: [
            /\/iiif\/manifest/,
            '',
          ],
        },
      },
      selectedTheme: 'sul',
      themes: {
        sul: {
          palette: {
            type: 'light',
            primary: {
              main: '#8c1515',
            },
            secondary: {
              main: '#8c1515',
            },
            shades: {
              dark: '#2e2d29',
              main: '#ffffff',
              light: '#f4f4f4',
            },
            notification: {
              main: '#e98300'
            },
          }
        }
      },
      windows: [
        {
          loadedManifest: data.m3Uri
        }
      ],
      window: {
        allowClose: false,
        allowFullscreen: true,
        allowMaximize: false,
        defaultSideBarPanel: 'attribution',
        hideWindowTitle: (data.hideTitle === true),
        sideBarOpenByDefault: true
      },
      workspaceControlPanel: {
        enabled: false,
        showZoomControls: true
      }
    }, [
      miradorSharePlugin, miradorShareDialogPlugin,
    ]);
  }
}
