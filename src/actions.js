import * as types from "./action-types"

export function addStatus(status, channel) {
  return {
    type: types.ADD_STATUS,
    payload: {
      status,
      channel
    }
  }
}

export function addStatuses(statuses, channel) {
  return {
    type: types.ADD_STATUSES,
    payload: {
      statuses,
      channel
    }
  }
}

export function updateStatus(status) {
  return {
    type: types.UPDATE_STATUS,
    payload: {
      status
    }
  }
}

export function setAccessToken(accessToken) {
  return {
    type: types.SET_ACCESS_TOKEN,
    payload: {
      accessToken
    }
  }
}
