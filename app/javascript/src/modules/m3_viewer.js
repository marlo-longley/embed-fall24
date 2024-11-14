'use strict';

import Mirador from 'mirador/dist/es/src/index.js';
import miradorImageToolsPlugin from 'mirador-image-tools/es/plugins/miradorImageToolsPlugin.js';
import miradorShareDialogPlugin from 'mirador-share-plugin/es/MiradorShareDialog.js';
import miradorSharePlugin from 'mirador-share-plugin/es/miradorSharePlugin.js';
import miradorDownloadPlugin from 'mirador-dl-plugin/es/miradorDownloadPlugin.js';
import miradorDownloadDialogPlugin from 'mirador-dl-plugin/es/MiradorDownloadDialog.js';
import shareMenuPlugin from '../plugins/shareMenuPlugin';
import miradorZoomBugPlugin from '../plugins/miradorZoomBugPlugin';
import embedModePlugin from '../plugins/embedModePlugin';
import analyticsPlugin from '../plugins/analyticsPlugin';
import cdlAuthPlugin from '../plugins/cdlAuthPlugin';
import { getExportableState } from 'mirador/dist/es/src/state/selectors';
import { importMiradorState } from 'mirador/dist/es/src/state/actions';

export default {
  init: function() {
    const el = document.getElementById('sul-embed-m3');
    const data = el.dataset;
    console.log("data props", data)
    const showAttribution = (data.showAttribution === 'true')
    const hideWindowTitle = (data.hideTitle === 'true')
    const imageTools = (data.imageTools === 'true')
    const cdl = (data.cdl === 'true')

    // Determine which panel should be open
    var sideBarPanel = 'info';
    if (data.search.length > 0) {
      sideBarPanel = 'search';
    }
    if (showAttribution) {
      sideBarPanel = 'attribution';
    }

    const viewerInstance = Mirador.viewer({
      id: 'sul-embed-m3',
      miradorDownloadPlugin: {
        restrictDownloadOnSizeDefinition: true,
      },
      miradorSharePlugin: {
        embedOption: {
          enabled: true,
          embedUrlReplacePattern: [
            /.*\.edu\/(\w+)\/iiif\d?\/manifest/,
            'https://localhost:3001/iframe?url=https://purl.stanford.edu/$1',
          ],
        },
        dragAndDropInfoLink: 'https://library.stanford.edu/iiif',
        shareLink: {
          enabled: true,
          manifestIdReplacePattern: [
            /(purl.*.stanford.edu.*)\/iiif\d?\/manifest(.json)?$/,
            '$1',
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
      // viewers: {
      //   'main': {
      //     flip: false,
      //     rotation: 0,
      //     x: 7190,
      //     y: 3668,
      //     zoom: 0.007
      //   }
      // },
      windows: [{
        id: 'main',
        defaultSearchQuery: data.search.length > 0 ? data.search : undefined,
        suggestedSearches: data.suggestedSearch.length > 0 ? [data.suggestedSearch] : null,
        loadedManifest: data.m3Uri,
        canvasIndex: Number(data.canvasIndex),
        canvasId: data.canvasId,
        ...(cdl && {
          cdl: {
            cdlHoldRecordId: data.cdlHoldRecordId && data.cdlHoldRecordId.toString(),
          }
        }),
      }],
      window: {
        allowClose: false,
        allowFullscreen: true,
        allowMaximize: false,
        authNewWindowCenter: 'screen',
        sideBarPanel,
        hideWindowTitle: hideWindowTitle,
        panels: {
          annotations: true,
          layers: true,
          search: true,
        },
        sideBarOpen: (showAttribution || data.search.length > 0),
        imageToolsEnabled: true,
        imageToolsOpen: false,
        views: [
          { key: 'single', behaviors: [null, 'individuals'] },
          { key: 'book', behaviors: [null, 'paged'] },
          { key: 'scroll', behaviors: ['continuous'] },
          { key: 'gallery' },
        ],
      },
      workspace: {
        showZoomControls: true,
        type: imageTools ? 'mosaic' : 'single',
        viewportPosition: {x: 1000, y: 2000},
      },
      workspaceControlPanel: {
        enabled: true,
      },
    }, [
      ...((cdl && cdlAuthPlugin) || []),
      ...((imageTools && miradorImageToolsPlugin) || []),
      (!cdl && shareMenuPlugin),
      miradorZoomBugPlugin,
      ...((imageTools && embedModePlugin) || []),
      {
        ...miradorSharePlugin,
        target: 'WindowTopBarShareMenu',
      },
      miradorShareDialogPlugin,
      miradorDownloadDialogPlugin,
      {
        ...miradorDownloadPlugin,
        target: 'WindowTopBarShareMenu',
      },
      analyticsPlugin,
    ].filter(Boolean));

    const setInitialState = () => {
      let parsedIncomingState;
      console.log("Sul-Embed: data.workspaceState", data)
      if (data.workspaceState) {
        try {
          // has a parsing issue
          parsedIncomingState = JSON.parse(data.workspaceState);
        }
        catch (e) {
          // debugger
          console.error('Sul-Embed: Failed to parse workspaceState', e);
          return;
        }
        const currentState = viewerInstance.store.getState();

        // a whole differnt manifest -- works and zoom
        let fakeState = {
          // need these
          companionWindows: {
            'cw-ed72ee1d-fee2-4576-893a-6b23d2ff98f5': {
              content: 'info',
              'default': true,
              id: 'cw-ed72ee1d-fee2-4576-893a-6b23d2ff98f5',
              position: 'left'
            },
            'cw-fb6aa601-013f-45ae-abc3-802b2fae7cfd': {
              content: 'thumbnailNavigation',
              'default': true,
              id: 'cw-fb6aa601-013f-45ae-abc3-802b2fae7cfd',
              position: 'off'
            },
            'cw-8b377fd1-5460-43ac-b00e-01f48826b861': {
              content: 'info',
              'default': true,
              id: 'cw-8b377fd1-5460-43ac-b00e-01f48826b861',
              position: 'left'
            },
            'cw-c783d735-8048-45f0-aa71-b1dd39ea31d8': {
              content: 'thumbnailNavigation',
              'default': true,
              id: 'cw-c783d735-8048-45f0-aa71-b1dd39ea31d8',
              position: 'off'
            },
            'cw-8a8cc999-3018-47ed-bbbf-275202f8a761': {
              content: 'info',
              'default': true,
              id: 'cw-8a8cc999-3018-47ed-bbbf-275202f8a761',
              position: 'left'
            },
            'cw-ea4dc08f-afbc-48f8-a913-ce3a19977d3e': {
              content: 'thumbnailNavigation',
              'default': true,
              id: 'cw-ea4dc08f-afbc-48f8-a913-ce3a19977d3e',
              position: 'off'
            }
          },
          // need
          viewers: {
            'main': {
              flip: false,
              rotation: 0,
              x: 7190,
              y: 3668,
              zoom: 0.0002512458092217809
            }
          },
          // need this
          windows: {
            'main': {
              canvasId: 'https://purl.stanford.edu/xy658qf4887/iiif/canvas/cocina-fileSet-xy658qf4887-8f893d9e-8b1c-4a89-9a6b-33a394a8cd3b',
              collectionIndex: 0,
              companionAreaOpen: true,
              companionWindowIds: [
                'cw-8a8cc999-3018-47ed-bbbf-275202f8a761',
                'cw-ea4dc08f-afbc-48f8-a913-ce3a19977d3e'
              ],
              draggingEnabled: true,
              highlightAllAnnotations: false,
              id: 'main',
              manifestId: 'https://purl.stanford.edu/xy658qf4887/iiif/manifest',
              maximized: false,
              rangeId: null,
              rotation: null,
              selectedAnnotations: {},
              sideBarOpen: false,
              sideBarPanel: 'info',
              thumbnailNavigationId: 'cw-ea4dc08f-afbc-48f8-a913-ce3a19977d3e',
              visibleCanvases: [
                'https://purl.stanford.edu/xy658qf4887/iiif/canvas/cocina-fileSet-xy658qf4887-8f893d9e-8b1c-4a89-9a6b-33a394a8cd3b'
              ]
            }
          },
          // need this
          workspace: {
            draggingEnabled: true,
            allowNewWindows: true,
            id: 'c3592bbe-a9c2-442e-bfdb-795c18f04fb2',
            isWorkspaceAddVisible: false,
            exposeModeOn: false,
            height: 5000,
            showZoomControls: false,
            type: 'mosaic',
            viewportPosition: {
              x: 0,
              y: 0
            },
            width: 5000,
            windowIds: [
              'main'
            ],
            focusedWindowId: 'main',
            layout: 'main'
          }
        }

        let mainState = {
          // need these
          companionWindows: {
            'cw-ed72ee1d-fee2-4576-893a-6b23d2ff98f5': {
              content: 'info',
              'default': true,
              id: 'cw-ed72ee1d-fee2-4576-893a-6b23d2ff98f5',
              position: 'left'
            },
            'cw-fb6aa601-013f-45ae-abc3-802b2fae7cfd': {
              content: 'thumbnailNavigation',
              'default': true,
              id: 'cw-fb6aa601-013f-45ae-abc3-802b2fae7cfd',
              position: 'off'
            },
            'cw-8b377fd1-5460-43ac-b00e-01f48826b861': {
              content: 'info',
              'default': true,
              id: 'cw-8b377fd1-5460-43ac-b00e-01f48826b861',
              position: 'left'
            },
            'cw-c783d735-8048-45f0-aa71-b1dd39ea31d8': {
              content: 'thumbnailNavigation',
              'default': true,
              id: 'cw-c783d735-8048-45f0-aa71-b1dd39ea31d8',
              position: 'off'
            },
            'cw-8a8cc999-3018-47ed-bbbf-275202f8a761': {
              content: 'info',
              'default': true,
              id: 'cw-8a8cc999-3018-47ed-bbbf-275202f8a761',
              position: 'left'
            },
            'cw-ea4dc08f-afbc-48f8-a913-ce3a19977d3e': {
              content: 'thumbnailNavigation',
              'default': true,
              id: 'cw-ea4dc08f-afbc-48f8-a913-ce3a19977d3e',
              position: 'off'
            }
          },
          // need
          viewers: {
            'main': {
              flip: false,
              rotation: 0,
              x: 7190,
              y: 3668,
              zoom: 0.0002512458092217809
            }
          },
          // need this
          windows: {
            'main': {
              canvasId: 'https://purl.stanford.edu/xy658qf4887/iiif/canvas/cocina-fileSet-xy658qf4887-8f893d9e-8b1c-4a89-9a6b-33a394a8cd3b',
              collectionIndex: 0,
              companionAreaOpen: true,
              companionWindowIds: [
                'cw-8a8cc999-3018-47ed-bbbf-275202f8a761',
                'cw-ea4dc08f-afbc-48f8-a913-ce3a19977d3e'
              ],
              draggingEnabled: true,
              highlightAllAnnotations: false,
              id: 'main',
              manifestId: 'https://purl.stanford.edu/xy658qf4887/iiif/manifest',
              maximized: false,
              rangeId: null,
              rotation: null,
              selectedAnnotations: {},
              sideBarOpen: false,
              sideBarPanel: 'info',
              thumbnailNavigationId: 'cw-ea4dc08f-afbc-48f8-a913-ce3a19977d3e',
              visibleCanvases: [
                'https://purl.stanford.edu/xy658qf4887/iiif/canvas/cocina-fileSet-xy658qf4887-8f893d9e-8b1c-4a89-9a6b-33a394a8cd3b'
              ]
            }
          },
          // need this
          workspace: {
            draggingEnabled: true,
            allowNewWindows: true,
            id: 'c3592bbe-a9c2-442e-bfdb-795c18f04fb2',
            isWorkspaceAddVisible: false,
            exposeModeOn: false,
            height: 5000,
            showZoomControls: false,
            type: 'mosaic',
            viewportPosition: {
              x: 0,
              y: 0
            },
            width: 5000,
            windowIds: [
              'main'
            ],
            focusedWindowId: 'main',
            layout: 'main'
          }
        }

        let mise = {
          "catalog": [
            {
              "manifestId": "https://purl.stanford.edu/xy658qf4887/iiif/manifest"
            },
            {
              "manifestId": "https://cudl.lib.cam.ac.uk/iiif/PR-CCF-00046-00036"
            },
            {
              "manifestId": "https://www.loc.gov/item/2021667096/manifest.json"
            },
            {
              "manifestId": "https://mise.stanford.edu/projects/a1808f4e-a38e-4f32-b902-952d3e3576b4/resources/iiif"
            }
          ],
          "companionWindows": {
            "cw-ed72ee1d-fee2-4576-893a-6b23d2ff98f5": {
              "content": "info",
              "default": true,
              "id": "cw-ed72ee1d-fee2-4576-893a-6b23d2ff98f5",
              "position": "left"
            },
            "cw-fb6aa601-013f-45ae-abc3-802b2fae7cfd": {
              "content": "thumbnailNavigation",
              "default": true,
              "id": "cw-fb6aa601-013f-45ae-abc3-802b2fae7cfd",
              "position": "off"
            },
            "cw-8b377fd1-5460-43ac-b00e-01f48826b861": {
              "content": "info",
              "default": true,
              "id": "cw-8b377fd1-5460-43ac-b00e-01f48826b861",
              "position": "left"
            },
            "cw-c783d735-8048-45f0-aa71-b1dd39ea31d8": {
              "content": "thumbnailNavigation",
              "default": true,
              "id": "cw-c783d735-8048-45f0-aa71-b1dd39ea31d8",
              "position": "off"
            },
            "cw-8a8cc999-3018-47ed-bbbf-275202f8a761": {
              "content": "info",
              "default": true,
              "id": "cw-8a8cc999-3018-47ed-bbbf-275202f8a761",
              "position": "left"
            },
            "cw-ea4dc08f-afbc-48f8-a913-ce3a19977d3e": {
              "content": "thumbnailNavigation",
              "default": true,
              "id": "cw-ea4dc08f-afbc-48f8-a913-ce3a19977d3e",
              "position": "off"
            },
            "cw-077d9262-50cc-4fb3-bf9d-99b82b0b2204": {
              "content": "info",
              "default": true,
              "id": "cw-077d9262-50cc-4fb3-bf9d-99b82b0b2204",
              "position": "left"
            },
            "cw-690a4dbd-dfb9-494c-b7ec-f1d86f6a1f6d": {
              "content": "thumbnailNavigation",
              "default": true,
              "id": "cw-690a4dbd-dfb9-494c-b7ec-f1d86f6a1f6d",
              "position": "off"
            },
            "cw-3c407558-a212-4e81-8f3e-c9c342a3d5cf": {
              "content": "info",
              "default": true,
              "id": "cw-3c407558-a212-4e81-8f3e-c9c342a3d5cf",
              "position": "left"
            },
            "cw-6db89f08-885f-46e5-84a1-96bdcd286463": {
              "content": "thumbnailNavigation",
              "default": true,
              "id": "cw-6db89f08-885f-46e5-84a1-96bdcd286463",
              "position": "off"
            }
          },
          "config": {
            "state": {},
            "canvasNavigation": {
              "height": 50,
              "width": 50
            },
            "selectedTheme": "light",
            "themes": {
              "dark": {
                "palette": {
                  "type": "dark",
                  "primary": {
                    "main": "#4db6ac"
                  },
                  "secondary": {
                    "main": "#4db6ac"
                  },
                  "shades": {
                    "dark": "#000000",
                    "main": "#424242",
                    "light": "#616161"
                  }
                }
              },
              "light": {
                "palette": {
                  "type": "light"
                }
              }
            },
            "theme": {
              "palette": {
                "type": "light",
                "primary": {
                  "main": "#1967d2"
                },
                "secondary": {
                  "main": "#1967d2"
                },
                "shades": {
                  "dark": "#eeeeee",
                  "main": "#ffffff",
                  "light": "#f5f5f5"
                },
                "error": {
                  "main": "#b00020"
                },
                "notification": {
                  "main": "#ffa224"
                },
                "hitCounter": {
                  "default": "#bdbdbd"
                },
                "highlights": {
                  "primary": "#ffff00",
                  "secondary": "#00BFFF"
                },
                "section_divider": "rgba(0, 0, 0, 0.25)",
                "annotations": {
                  "hidden": {
                    "globalAlpha": 0
                  },
                  "default": {
                    "strokeStyle": "#00BFFF",
                    "globalAlpha": 1
                  },
                  "hovered": {
                    "strokeStyle": "#BF00FF",
                    "globalAlpha": 1
                  },
                  "selected": {
                    "strokeStyle": "#ffff00",
                    "globalAlpha": 1
                  }
                },
                "search": {
                  "default": {
                    "fillStyle": "#00BFFF",
                    "globalAlpha": 0.3
                  },
                  "hovered": {
                    "fillStyle": "#00FFFF",
                    "globalAlpha": 0.3
                  },
                  "selected": {
                    "fillStyle": "#ffff00",
                    "globalAlpha": 0.3
                  }
                }
              },
              "typography": {
                "body1": {
                  "fontSize": "1rem",
                  "letterSpacing": "0em",
                  "lineHeight": "1.6em"
                },
                "body2": {
                  "fontSize": "0.878rem",
                  "letterSpacing": "0.015em",
                  "lineHeight": "1.6em"
                },
                "button": {
                  "fontSize": "0.878rem",
                  "letterSpacing": "0.09em",
                  "lineHeight": "2.25rem",
                  "textTransform": "uppercase"
                },
                "caption": {
                  "fontSize": "0.772rem",
                  "letterSpacing": "0.033em",
                  "lineHeight": "1.6rem"
                },
                "body1Next": {
                  "fontSize": "1rem",
                  "letterSpacing": "0em",
                  "lineHeight": "1.6em"
                },
                "body2Next": {
                  "fontSize": "0.878rem",
                  "letterSpacing": "0.015em",
                  "lineHeight": "1.6em"
                },
                "buttonNext": {
                  "fontSize": "0.878rem",
                  "letterSpacing": "0.09em",
                  "lineHeight": "2.25rem"
                },
                "captionNext": {
                  "fontSize": "0.772rem",
                  "letterSpacing": "0.33em",
                  "lineHeight": "1.6rem"
                },
                "overline": {
                  "fontSize": "0.678rem",
                  "fontWeight": 500,
                  "letterSpacing": "0.166em",
                  "lineHeight": "2em",
                  "textTransform": "uppercase"
                },
                "h1": {
                  "fontSize": "2.822rem",
                  "letterSpacing": "-0.015em",
                  "lineHeight": "1.2em"
                },
                "h2": {
                  "fontSize": "1.575rem",
                  "letterSpacing": "0em",
                  "lineHeight": "1.33em"
                },
                "h3": {
                  "fontSize": "1.383rem",
                  "fontWeight": 300,
                  "letterSpacing": "0em",
                  "lineHeight": "1.33em"
                },
                "h4": {
                  "fontSize": "1.215rem",
                  "letterSpacing": "0.007em",
                  "lineHeight": "1.45em"
                },
                "h5": {
                  "fontSize": "1.138rem",
                  "letterSpacing": "0.005em",
                  "lineHeight": "1.55em"
                },
                "h6": {
                  "fontSize": "1.067rem",
                  "fontWeight": 400,
                  "letterSpacing": "0.01em",
                  "lineHeight": "1.6em"
                },
                "subtitle1": {
                  "fontSize": "0.937rem",
                  "letterSpacing": "0.015em",
                  "lineHeight": "1.6em",
                  "fontWeight": 300
                },
                "subtitle2": {
                  "fontSize": "0.878rem",
                  "fontWeight": 500,
                  "letterSpacing": "0.02em",
                  "lineHeight": "1.75em"
                },
                "useNextVariants": true
              },
              "overrides": {
                "MuiListSubheader": {
                  "root": {
                    "&[role=\"presentation\"]:focus": {
                      "outline": 0
                    }
                  }
                },
                "MuiTooltip": {
                  "tooltipPlacementLeft": {
                    "@media (min-width:600px)": {
                      "margin": 0
                    }
                  },
                  "tooltipPlacementRight": {
                    "@media (min-width:600px)": {
                      "margin": 0
                    }
                  },
                  "tooltipPlacementTop": {
                    "@media (min-width:600px)": {
                      "margin": 0
                    }
                  },
                  "tooltipPlacementBottom": {
                    "@media (min-width:600px)": {
                      "margin": 0
                    }
                  }
                },
                "MuiTouchRipple": {
                  "childPulsate": {
                    "animation": "none"
                  },
                  "rippleVisible": {
                    "animation": "none"
                  }
                }
              },
              "props": {
                "MuiButtonBase": {
                  "disableTouchRipple": true
                },
                "MuiLink": {
                  "underline": "always"
                }
              }
            },
            "language": "en",
            "availableLanguages": {
              "ar": "العربية",
              "de": "Deutsch",
              "en": "English",
              "fr": "Français",
              "ja": "日本語",
              "kr": "한국어",
              "lt": "Lietuvių",
              "nl": "Nederlands",
              "nb-NO": "Norwegian Bokmål",
              "pl": "Polski",
              "pt-BR": "Português do Brasil",
              "vi": "Tiếng Việt",
              "zh-CN": "中文(简体)",
              "zh-TW": "中文(繁體)",
              "it": "Italiano",
              "sr": "Српски",
              "sv": "Svenska"
            },
            "annotations": {
              "htmlSanitizationRuleSet": "iiif",
              "filteredMotivations": [
                "oa:commenting",
                "oa:tagging",
                "sc:painting",
                "commenting",
                "tagging"
              ]
            },
            "createGenerateClassNameOptions": {
              "productionPrefix": "mirador"
            },
            "requests": {
              "preprocessors": [],
              "postprocessors": []
            },
            "translations": {},
            "window": {
              "allowClose": true,
              "allowFullscreen": false,
              "allowMaximize": true,
              "allowTopMenuButton": true,
              "allowWindowSideBar": true,
              "authNewWindowCenter": "parent",
              "sideBarPanel": "info",
              "defaultSidebarPanelHeight": 201,
              "defaultSidebarPanelWidth": 235,
              "defaultView": "single",
              "forceDrawAnnotations": false,
              "hideWindowTitle": false,
              "highlightAllAnnotations": false,
              "showLocalePicker": false,
              "sideBarOpen": false,
              "switchCanvasOnSearch": true,
              "panels": {
                "info": true,
                "attribution": true,
                "canvas": true,
                "annotations": true,
                "search": true,
                "layers": true
              },
              "views": [
                {
                  "key": "single",
                  "behaviors": [
                    "individuals"
                  ]
                },
                {
                  "key": "book",
                  "behaviors": [
                    "paged"
                  ]
                },
                {
                  "key": "scroll",
                  "behaviors": [
                    "continuous"
                  ]
                },
                {
                  "key": "gallery"
                }
              ],
              "elastic": {
                "height": 400,
                "width": 480
              }
            },
            "windows": [],
            "thumbnails": {
              "preferredFormats": [
                "jpg",
                "png",
                "webp",
                "tif"
              ]
            },
            "thumbnailNavigation": {
              "defaultPosition": "off",
              "displaySettings": true,
              "height": 130,
              "width": 100
            },
            "workspace": {
              "draggingEnabled": true,
              "allowNewWindows": true,
              "id": "8aff0fae-215b-4ec6-ae49-b1e1715e52a0",
              "isWorkspaceAddVisible": false,
              "exposeModeOn": false,
              "height": 5000,
              "showZoomControls": false,
              "type": "mosaic",
              "viewportPosition": {
                "x": 0,
                "y": 0
              },
              "width": 5000
            },
            "workspaceControlPanel": {
              "enabled": true
            },
            "galleryView": {
              "height": 120,
              "width": null
            },
            "osdConfig": {
              "alwaysBlend": false,
              "blendTime": 0.1,
              "preserveImageSizeOnResize": true,
              "preserveViewport": true,
              "showNavigationControl": false
            },
            "export": {
              "catalog": true,
              "companionWindows": true,
              "config": true,
              "elasticLayout": true,
              "layers": true,
              "manifests": {},
              "viewers": true,
              "windows": true,
              "workspace": true
            },
            "audioOptions": {
              "controls": true,
              "crossOrigin": "anonymous"
            },
            "videoOptions": {
              "controls": true,
              "crossOrigin": "anonymous"
            },
            "auth": {
              "serviceProfiles": [
                {
                  "profile": "http://iiif.io/api/auth/1/external",
                  "external": true
                },
                {
                  "profile": "http://iiif.io/api/auth/1/kiosk",
                  "kiosk": true
                },
                {
                  "profile": "http://iiif.io/api/auth/1/clickthrough"
                },
                {
                  "profile": "http://iiif.io/api/auth/1/login"
                },
                {
                  "profile": "http://iiif.io/api/auth/0/external",
                  "external": true
                },
                {
                  "profile": "http://iiif.io/api/auth/0/kiosk",
                  "kiosk": true
                },
                {
                  "profile": "http://iiif.io/api/auth/0/clickthrough"
                },
                {
                  "profile": "http://iiif.io/api/auth/0/login"
                }
              ]
            },
            "id": "m-557376e6131dedf5cd9da187c8a2509b",
            "annotation": {}
          },
          "elasticLayout": {
            "window-902dfa7d-11c2-47b7-b240-47770416e14a": {
              "windowId": "window-902dfa7d-11c2-47b7-b240-47770416e14a",
              "height": 400,
              "width": 480,
              "x": 200,
              "y": 200
            }
          },
          "layers": {},
          "manifests": {},
          "viewers": {
            "window-902dfa7d-11c2-47b7-b240-47770416e14a": {
              "flip": false,
              "rotation": 0,
              "x": 4272,
              "y": 6369,
              "zoom": 0.0007913669064748202
            }
          },
          "windows": {
            "window-902dfa7d-11c2-47b7-b240-47770416e14a": {
              "canvasId": "https://purl.stanford.edu/xy658qf4887/iiif/canvas/cocina-fileSet-xy658qf4887-8f893d9e-8b1c-4a89-9a6b-33a394a8cd3b",
              "collectionIndex": 0,
              "companionAreaOpen": true,
              "companionWindowIds": [
                "cw-3c407558-a212-4e81-8f3e-c9c342a3d5cf",
                "cw-6db89f08-885f-46e5-84a1-96bdcd286463"
              ],
              "draggingEnabled": true,
              "highlightAllAnnotations": false,
              "id": "window-902dfa7d-11c2-47b7-b240-47770416e14a",
              "manifestId": "https://purl.stanford.edu/xy658qf4887/iiif/manifest",
              "maximized": false,
              "rangeId": null,
              "rotation": null,
              "selectedAnnotations": {},
              "sideBarOpen": false,
              "sideBarPanel": "info",
              "thumbnailNavigationId": "cw-6db89f08-885f-46e5-84a1-96bdcd286463",
              "visibleCanvases": [
                "https://purl.stanford.edu/xy658qf4887/iiif/canvas/cocina-fileSet-xy658qf4887-8f893d9e-8b1c-4a89-9a6b-33a394a8cd3b"
              ]
            }
          },
          "workspace": {
            "draggingEnabled": true,
            "allowNewWindows": true,
            "id": "64d97181-2d71-4fce-ad25-c5c1d17d0edc",
            "isWorkspaceAddVisible": false,
            "exposeModeOn": false,
            "height": 5000,
            "showZoomControls": false,
            "type": "mosaic",
            "viewportPosition": {
              "x": 0,
              "y": 0
            },
            "width": 5000,
            "windowIds": [
              "window-902dfa7d-11c2-47b7-b240-47770416e14a"
            ],
            "focusedWindowId": "window-902dfa7d-11c2-47b7-b240-47770416e14a",
            "layout": "window-902dfa7d-11c2-47b7-b240-47770416e14a"
          }
        }

        let newState = {
          ...currentState,
          ...parsedIncomingState
        }
      
        // THE ISSUE IS the MAIN windowId 
        viewerInstance.store.dispatch(
          importMiradorState({
            ...newState,
            config: {preserveViewport: true, ...newState.config},
          },)
        );
        console.log("viewerInstance.store.getState().config", viewerInstance.store.getState().config)
      }
    };
    // for redux plugin pattern tips https://github.com/ProjectMirador/mirador/issues/3531
    if (data.workspaceState) {
      setInitialState();
    }

    // Listen for messages from the parent window inside the iframe
    window.addEventListener('message', (event) => {
      // TODO: Ensure the message is coming from a trusted origin
      // if (event.origin !== 'something-sul') {
      //   return;
      // }
      if (event && event.data) {
        let parsedData;
        try {
          parsedData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        } catch (error) {
          console.error('Failed to parse event data:', error);
          return; // Exit if parsing fails
        }
    
        if (parsedData.type === "requestState") {
          const currentState = viewerInstance.store.getState();
          const exportableState = getExportableState(currentState);
          console.log("Sul-Embed: Sending iframe state to parent...")
          // Send the state back to the parent window
          window.parent.postMessage(
            JSON.stringify({
              type: 'stateResponse',
              data: exportableState,
              source: 'sul-embed-m3',
            }),
            '*'
          ); // Change '*' to a specific origin ??
        }
      }
    });
  }
}
