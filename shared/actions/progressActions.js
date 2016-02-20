import {UPDATE_PROGRESS} from './actionTypes.js'

export function updateProgress(data) {
  return {
    type:    UPDATE_PROGRESS,
    payload: {
      progress: data
    }
  }
}
