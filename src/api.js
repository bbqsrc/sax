import API from "./generated/api"

const token = ""

function parseChannel(channel) {
    switch (channel) {
    case "user":
        return "user"
    case "local":
        return "public&local=true"
    case "federated":
        return "public"
    case "hashtag":
        return `hashtag&tag=${tag}`
    default:
        throw new TypeError("Invalid value for channel: " + channel)
    }
}

API.prototype.stream = function stream(channel, tag) {
    const accessToken = this.headers.Authorization.split(" ")[1]
    const streamValue = parseChannel(channel)
    const url = `wss://${this.host}/api/v1/streaming?access_token=${accessToken}&stream=${streamValue}`

    return new WebSocket(url)
}

const api = new API({
  headers: {
    Authorization: "Bearer " + token
  }
})

export default api