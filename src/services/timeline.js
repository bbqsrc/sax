import { addStatus, addStatuses } from "../actions"
import store from "../store"
import api from "../api"
import StatusStreamReader from "../utilities/status-stream-reader"

const generate = {
  user: () => api.getHomeTimeline(),
  local: () => api.getPublicTimeline(),
  federated: () => api.getPublicTimeline()
}

export default class TimelineService {
  constructor() {
    this.init("user")
    this.init("local")
    this.init("federated")
  }

  init(key) {
    generate[key]().then(statuses => {
      store.dispatch(addStatuses(statuses, key))

      this[key] = this.connectStream(key)
    }).catch(error => {
      alert(error)
    })
  }

  connectStream(channel, tag) {
    const stream = new StatusStreamReader(channel, tag)

    stream.onUpdate = (status) => {
      store.dispatch(addStatus(status, channel, tag))
    }

    return stream
  }
}