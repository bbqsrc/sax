import { createStore, applyMiddleware, combineReducers } from "redux"
import * as types from "./action-types"

const initialState = {
  route: null,
  accessToken: null,

  statuses: {
    home: [],
    local: [],
    federated: []
  }
}

function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case types.SET_ACCESS_TOKEN:
    return { ...state, accessToken: action.payload.accessToken }
  case types.SET_ROUTE:
    return { ...state, route: action.payload.route }
  case types.UPDATE_STATUS: {
    let statuses = { ...state.statuses }
    const { status } = action.payload

    console.log("UPDATE")

    const replace = (oldList) => {
      const list = oldList.slice()
      const i = list.findIndex(x => x.id === status.id)

      if (i > -1) {
        console.log("FIND ", i)
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

    switch (action.payload.channel) {
    case "user":
      statuses.home = statuses.home.slice()
      statuses.home.unshift(action.payload.status)
      break
    case "local":
      statuses.local = statuses.local.slice()
      statuses.local.unshift(action.payload.status)
      break
    case "federated":
      statuses.federated = statuses.federated.slice()
      statuses.federated.unshift(action.payload.status)
      break
    }

    return { ...state, statuses }
  }
  case types.ADD_STATUSES: {
    let statuses = { ...state.statuses }

    switch (action.payload.channel) {
    case "user":
      statuses.home = action.payload.statuses.concat(statuses.home)
      break
    case "local":
      statuses.local = action.payload.statuses.concat(statuses.local)
      break
    case "federated":
      statuses.federated = action.payload.statuses.concat(statuses.federated)
      break
    }

    return { ...state, statuses }
  }}

  return state
}

const store = createStore(reducer)

export default store