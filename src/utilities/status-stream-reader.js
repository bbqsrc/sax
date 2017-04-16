import { models } from "../generated/api"
import api from "../api"

export default class StatusStreamReader {
  constructor(channel, tag) {
    this.socket = api.stream(channel, tag)

    this.socket.onclose = (err, err2) => {
      console.log("CLOSE")
    }

    this.socket.onopen = (a) => {
      console.log("OPEN")
    }

    this.socket.onmessage = (message) => {
      let msg

      try {
        msg = JSON.parse(message.data)
      } catch (err) {
        console.error(err.stack)
        return
      }

      const { event, payload } = msg

      switch (event) {
      case "delete": {
        this.onDelete(payload)
        break
      }
      case "update": {
        const model = new models.Status(JSON.parse(payload))

        this.onUpdate(model)
        break
      }
      case "notification": {
        const model = new models.Notification(JSON.parse(payload))

        this.onNotification(model)
        break
      }
      default:
        console.error(msg)
      }
    }

    this.onUpdate = () => {}
    this.onDelete = () => {}
    this.onNotification = () => {}
  }
}
