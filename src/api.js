import API from "./generated/api"
import request from "superagent"

const clientId = "2dcab50fc2d55ac8d4804d4f9440703369c1fcc242e08ab3235acc1ca3c2b0dd"
const clientSecret = "84e094575c36f1086abadf49efa5ee381891c83c36771bddb74e6ef9a41f7ff0"

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

API.prototype.configure = function configure(host, token) {
  this.host = host
  this.headers = {
    Authorization: `Bearer ${token}`
  }
  return this
}

export function getToken(host, code) {
  return request.post(`https://${host}/oauth/token`)
    .type('form')
    .send({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
      grant_type: "authorization_code",
      code
    })
    .then(res => {
      return res.body.access_token
    })
}

const api = new API({})
const { models } = API

export { models }
export default api