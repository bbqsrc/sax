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

export function setAccessToken(host, accessToken) {
  return {
    type: types.SET_ACCESS_TOKEN,
    payload: {
      host,
      accessToken
    }
  }
}

export function replyTo(status) {
  return {
    type: types.REPLY_TO,
    payload: {
      status
    }
  }
}

export function setStatusInput(text) {
  return {
    type: types.SET_STATUS_INPUT,
    payload: {
      text
    }
  }
}

export function addNotifications(notifications) {
  return {
    type: types.ADD_NOTIFICATIONS,
    payload: {
      notifications
    }
  }
}