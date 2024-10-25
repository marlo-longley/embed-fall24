import { takeEvery, put, select } from 'redux-saga/effects';
import { SET_CANVAS, IMPORT_MIRADOR_STATE } from './actionTypes'; // Adjust the import as necessary
import { importMiradorState } from './actions'; // Adjust the import as necessary

function* handleSetCanvas(action) {
    const { payload: canvasId } = action;

    // Prepare the state to be imported
    const stateToImport = {
        // Fill in your state structure as needed
        currentCanvasId: canvasId,
        // Include any other relevant state details...
    };

    // Dispatch IMPORT_MIRADOR_STATE with the new state
    yield put(importMiradorState(stateToImport));
}

function* rootSaga() {
  console.log('canvasImportPlugin: rootSaga');
  yield takeEvery(SET_CANVAS, handleSetCanvas);
}

const canvasImportPlugin = {
    component: () => null,
    saga: rootSaga,
};

export default canvasImportPlugin;
