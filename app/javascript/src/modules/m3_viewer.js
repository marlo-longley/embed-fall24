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
            'window-2ce951c0-e66e-4f8e-b554-ad1b5698c10d': {
              flip: false,
              rotation: 0,
              x: 7190,
              y: 3668,
              zoom: 0.0002512458092217809
            }
          },
          // need this
          windows: {
            'window-2ce951c0-e66e-4f8e-b554-ad1b5698c10d': {
              canvasId: 'https://purl.stanford.edu/xy658qf4887/iiif/canvas/cocina-fileSet-xy658qf4887-8f893d9e-8b1c-4a89-9a6b-33a394a8cd3b',
              collectionIndex: 0,
              companionAreaOpen: true,
              companionWindowIds: [
                'cw-8a8cc999-3018-47ed-bbbf-275202f8a761',
                'cw-ea4dc08f-afbc-48f8-a913-ce3a19977d3e'
              ],
              draggingEnabled: true,
              highlightAllAnnotations: false,
              id: 'window-2ce951c0-e66e-4f8e-b554-ad1b5698c10d',
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
              'window-2ce951c0-e66e-4f8e-b554-ad1b5698c10d'
            ],
            focusedWindowId: 'window-2ce951c0-e66e-4f8e-b554-ad1b5698c10d',
            layout: 'window-2ce951c0-e66e-4f8e-b554-ad1b5698c10d'
          }
        }

        let newState = {
          ...currentState,
          ...parsedIncomingState
        }
      

        // THE ISSUE IS the MAIN windowId 
        viewerInstance.store.dispatch(
          importMiradorState(newState)
        );
      }
    };
    // for redux pattern tips https://github.com/ProjectMirador/mirador/issues/3531
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

        if (parsedData.type === "importState" && parsedData.data) {
          console.log("Sul-Embed: Importing state from parent...")
          debugger
          viewerInstance.store.dispatch(
            importMiradorState({
              ...combinedState,
              config: combinedState.config,
            })
          );
        }
      }
    });
  }
}
