import { addStatus, addStatuses, addNotifications } from "../actions"
import store from "../store"
import api from "../api"
import StatusStreamReader from "../utilities/status-stream-reader"

const generate = {
  user: (api) => api.getHomeTimeline({ limit: 50 }),
  local: (api) => api.getPublicTimeline(),
  federated: (api) => api.getPublicTimeline()
}

export default class TimelineService {
  constructor(host, accessToken) {
    this.api = api

    this.init("user")
    this.init("local")
    this.init("federated")

    this.initNotifications()
  }

  initNotifications() {
    this.api.getNotifications({ limit: 30 }).then(notifications => {
      store.dispatch(addNotifications(notifications))
    })
  }

  init(key) {
    generate[key](this.api).then(statuses => {
      store.dispatch(addStatuses(statuses, key))

      this[key] = this.connectStream(this.api, key)
    })
  }

  connectStream(api, channel, tag) {
    const stream = new StatusStreamReader(api, channel, tag)

    stream.onUpdate = (status) => {
      store.dispatch(addStatus(status, channel, tag))
    }

    return stream
  }
}