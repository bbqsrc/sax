import { AsyncStorage } from "react-native-macos"
import { createStore, applyMiddleware, combineReducers } from "redux"
import * as types from "./action-types"
import api from "./api"

const initialState = {
  route: null,
  accessToken: null,
  host: null,

  statuses: {
    home: [],
    local: [],
    federated: []
  },

  notifications: [],

  replyTo: null,
  statusInput: ""
}

function reducer(state = initialState, action = {}) {
  const { type, payload } = action

  switch (type) {
  case types.SET_STATUS_INPUT:
    console.log(payload.text)
    return { ...state, statusInput: payload.text }
  case types.REPLY_TO:
    return { ...state, replyTo: payload.status }
  case types.SET_ACCESS_TOKEN:
    AsyncStorage.setItem("ACCESS_TOKEN", JSON.stringify(payload))
    api.configure(payload.host, payload.accessToken)
    return { ...state, host: payload.host, accessToken: payload.accessToken }
  case types.SET_ROUTE:
    return { ...state, route: payload.route }
  case types.UPDATE_STATUS: {
    let statuses = { ...state.statuses }
    const { status } = payload

    const replace = (oldList) => {
      const list = oldList.slice()
      const i = list.findIndex(x => x.id === status.id)

      if (i > -1) {
        list[i] = status
      }

      return list
    }

    statuses.home = replace(statuses.home)
    statuses.local = replace(statuses.local)
    statuses.federated = replace(statuses.federated)

    return { ...state, statuses }
  }
  case types.ADD_STATUS: {
    let statuses = { ...state.statuses }

    switch (payload.channel) {
    case "user":
      statuses.home = statuses.home.slice()
      statuses.home.unshift(payload.status)
      break
    case "local":
      statuses.local = statuses.local.slice()
      statuses.local.unshift(payload.status)
      break
    case "federated":
      statuses.federated = statuses.federated.slice()
      statuses.federated.unshift(payload.status)
      break
    }

    return { ...state, statuses }
  }
  case types.ADD_STATUSES: {
    let statuses = { ...state.statuses }

    switch (payload.channel) {
    case "user":
      statuses.home = payload.statuses.concat(statuses.home)
      break
    case "local":
      statuses.local = payload.statuses.concat(statuses.local)
      break
    case "federated":
      statuses.federated = payload.statuses.concat(statuses.federated)
      break
    }

    return { ...state, statuses }
  }
  case types.ADD_NOTIFICATIONS: {
    const notifications = payload.notifications.concat(state.notifications)
    
    return { ...state, notifications }
  }}

  return state
}

const store = createStore(reducer)

export default store