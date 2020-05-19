import { createStore as reduxCreateStore } from 'redux';
import { saveState } from './localStorage';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE_NAME':
      return { ...state, name: action.value };

    case 'TOGGLE_GOOGLE_AUTO_EXPORT':
      return { ...state, google_auto_export: !state.google_auto_export };

    case 'CHANGE_WEIGHT':
      return { ...state, weight: parseFloat(action.value) };

    // SPEED
    case 'CHANGE_SPEED_EXTRA_WEIGHT':
      return { ...state, speed_extra_weight: parseFloat(action.value) };

    case 'CHANGE_SPEED_LOSS':
      return { ...state, speed_loss: parseFloat(action.value) };

    case 'CHANGE_SPEED_ONE_RM':
      return { ...state, speed_onerm: parseFloat(action.value) };

    // STRENGTH
    case 'CHANGE_STRENGTH_EXTRA_WEIGHT':
      return { ...state, strength_extra_weight: parseFloat(action.value) };

    case 'CHANGE_STRENGTH_EDGE_SIZE':
      return { ...state, strength_edge_size: parseFloat(action.value) };

    case 'CHANGE_STRENGTH_EXPECTED':
      return { ...state, strength_expected: parseFloat(action.value) };

    case 'CHANGE_STRENGTH_EXPECTED_PCT':
      return { ...state, strength_expected_pct: parseFloat(action.value) };

    default:
      console.log('unkown reducer', action);
      break;
  }

  return state;
};

const initialState = {
  name: '',
  weight: 70,
  google_auto_export: false,

  speed_extra_weight: 20,
  speed_loss: 20,
  speed_onerm: 40,

  strength_extra_weight: 20,
  strength_edge_size: 20,
  strength_expected: 90,
  strength_expected_pct: 10,
};

// Use initialState values only if we don't have in the local storage
const createStore = (persistedState={}) => {
  // Fill empty persistedState values with initialState
  Object.entries(initialState).forEach(([key, value]) => {
    if (!persistedState[key]) {
      persistedState[key] = value;
    }
  });

  saveState(persistedState);

  return reduxCreateStore(reducer, persistedState);
};
export default createStore;
