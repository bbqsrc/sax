// @flow
"use strict";

const __ = {
  Immutable: require("immutable"),
  superagent: require("superagent"),
  hasRequired: function hasRequired(a, b) {
    a = new Set(a)
    const s = new Set([...b].filter(x => !a.has(x)))

    if (s.size > 0) {
      throw new TypeError(`Missing required keys: ${Array.from(s.values()).join(", ")}`)
    }
  },
  createModel: function createModel(model, data) {
    if (data != null) {
      if (Array.isArray(model)) {
        return data.map(d => new(model[0])(d))
      }
      return new(model)(data)
    }
  },
  request: function request(method, endpoint, options) {
    const { model, query, body, files, fields, headers, contentType } = options

    const url = `${this.baseUrl}${endpoint}`

    let req = __.superagent(method, url)
      .set(Object.assign({}, this.headers, headers))
      .query(Object.assign({}, this.query, query))

    if (contentType) {
      req = req.type(contentType)
    }

    if (options.query) {
      req = req.query(options.query)
    }

    if (contentType === "multipart/form-data") {
      if (files) {
        for (const key in stripNull(files)) {
          if (files[key] == null) {
            continue
          }

          req = req.attach(key, files[key])
        }
      }

      if (fields) {
        for (const key in fields) {
          if (fields[key] == null) {
            continue
          }

          req = req.field(key, fields[key])
        }
      }
    } else if (body) {
      req = req.send(body)
    }

    return req.then(res => {
      if (res.error) {
        const err = new Error(`Status code was not successful: ${res.status}`)

        err.response = res
        throw err
      }

      if (model) {
        return __.createModel(model, res.body)
      }

      return res.body
    })
  }
}

__.Enum = class Enum {
  constructor(baseClass, map) {
    class EnumProperty extends baseClass {
      constructor(key, value) {
        super()

        this.value = value
        this.key = key

        this.symbol = Symbol.for(key)

        Object.freeze(this)
      }

      inspect() {
        return `EnumProp(${baseClass.name}.${this.key})`
      }

      toString() {
        return this.key
      }

      valueOf() {
        return this.value
      }

      toJSON() {
        return this.value
      }
    }

    Object.defineProperty(this, "class", { value: baseClass })

    if (Array.isArray(map)) {
      map = map.reduce((o, k, i) => {
        if (typeof k !== "string") {
          throw new TypeError("Enum keys must all be strings")
        }

        if (o[k] != null) {
          throw new TypeError("Enum keys must be unique")
        }

        o[k] = i
        return o
      }, {})
    }

    for (const key in map) {
      Object.defineProperty(this, key, {
        value: new EnumProperty(key, map[key]),
        enumerable: true
      })
    }

    Object.freeze(this)
  }

  from(value) {
    for (const key in this) {
      if (this[key].valueOf() === value) {
        return this[key]
      }
    }

    throw new TypeError(`No enum property found for value ${value}`)
  }

  inspect() {
    return `Enum(${this.class.name})`
  }

  toString() {
    return this.class.toString()
  }
}

class MastodonApi {
  constructor(options) {
    this.host = options.host || "mastodon.social"
    this.scheme = options.scheme || "https"
    this.headers = options.headers || {}
    this.query = options.query || {}
  }

  get baseUrl() {
    return `${this.scheme}://${this.host}`
  }
  /*
    Get Account

  */
  getAccount(params = {}) {
    const o = {}
    o.model = Account
    return __.request.call(this, "get", `/api/v1/accounts/${params.id}`, o)
  }
  /*
    Verify Credentials

  */
  verifyCredentials(params = {}) {
    const o = {}
    o.model = Account
    return __.request.call(this, "get", `/api/v1/accounts/verify_credentials`, o)
  }
  /*
    Register Application

  */
  registerApplication(params = {}) {
    const o = {}
    o.model = OAuthResponse
    o.contentType = "application/x-www-form-urlencoded"
    o.files = {}
    o.fields = {}
    o.fields["client_name"] = params.clientName
    o.fields["redirect_uris"] = params.redirectUris
    o.fields["scopes"] = params.scopes
    o.fields["website"] = params.website
    return __.request.call(this, "post", `/api/v1/apps`, o)
  }
  /*
    Get Notifications

  */
  getNotifications(params = {}) {
    const o = {}
    o.model = [Notification]
    return __.request.call(this, "get", `/api/v1/notifications`, o)
  }
  /*
    Post Status

  */
  postStatus(params = {}) {
    const o = {}
    o.model = Status
    o.body = params.body.toJSON()
    return __.request.call(this, "post", `/api/v1/statuses`, o)
  }
  /*
    

  */
  getStatus(params = {}) {
    const o = {}
    o.model = Status
    return __.request.call(this, "get", `/api/v1/statuses/${params.id}`, o)
  }
  /*
    Reblog

  */
  reblog(params = {}) {
    const o = {}
    o.model = Status
    return __.request.call(this, "post", `/api/v1/statuses/${params.id}/reblog`, o)
  }
  /*
    Unreblog

  */
  unreblog(params = {}) {
    const o = {}
    o.model = Status
    return __.request.call(this, "post", `/api/v1/statuses/${params.id}/unreblog`, o)
  }
  /*
    Favourite

  */
  favourite(params = {}) {
    const o = {}
    o.model = Status
    return __.request.call(this, "post", `/api/v1/statuses/${params.id}/favourite`, o)
  }
  /*
    Unfavourite

  */
  unfavourite(params = {}) {
    const o = {}
    o.model = Status
    return __.request.call(this, "post", `/api/v1/statuses/${params.id}/unfavourite`, o)
  }
  /*
    Get Home Timeline
  
    Return the home timeline

  */
  getHomeTimeline(params = {}) {
    const o = {}
    o.model = [Status]
    o.query = {}
    o.query["max_id"] = params.maxId
    o.query["limit"] = params.limit
    return __.request.call(this, "get", `/api/v1/timelines/home`, o)
  }
  /*
    Get Public Timeline
  
    Return the public timeline

  */
  getPublicTimeline(params = {}) {
    const o = {}
    o.model = [Status]
    o.query = {}
    o.query["local"] = params.local
    o.query["max_id"] = params.maxId
    o.query["limit"] = params.limit
    return __.request.call(this, "get", `/api/v1/timelines/public`, o)
  }
}

class Account extends __.Immutable.Record({
  "id": undefined,
  "username": undefined,
  "acct": undefined,
  "displayName": undefined,
  "note": undefined,
  "url": undefined,
  "locked": undefined,
  "createdAt": undefined,
  "followersCount": undefined,
  "followingCount": undefined,
  "statusesCount": undefined,
  "avatar": undefined,
  "header": undefined,
}) {
  constructor(params) {
    __.hasRequired(Object.keys(params), ["id", "username", "acct", "display_name", "note", "url", "locked", "created_at", "followers_count", "following_count", "statuses_count"])
    
    const p = {}
  
    p.id = params["id"]
    p.username = params["username"]
    p.acct = params["acct"]
    p.displayName = params["display_name"]
    p.note = params["note"]
    p.url = params["url"]
    if (params["avatar"] != null) {
      p.avatar = params["avatar"]
    }
    if (params["header"] != null) {
      p.header = params["header"]
    }
    p.locked = params["locked"]
    p.createdAt = params["created_at"]
    p.followersCount = params["followers_count"]
    p.followingCount = params["following_count"]
    p.statusesCount = params["statuses_count"]

    super(p)
  }

  toJSON() {
    const o = {}

    o["id"] = this.id
    o["username"] = this.username
    o["acct"] = this.acct
    o["display_name"] = this.displayName
    o["note"] = this.note
    o["url"] = this.url
    if (this.avatar != null) {
      o["avatar"] = this.avatar
    }
    if (this.header != null) {
      o["header"] = this.header
    }
    o["locked"] = this.locked
    o["created_at"] = this.createdAt
    o["followers_count"] = this.followersCount
    o["following_count"] = this.followingCount
    o["statuses_count"] = this.statusesCount
    
    return o
  }
}

class Application extends __.Immutable.Record({
  "name": undefined,
  "website": undefined,
}) {
  constructor(params) {
    __.hasRequired(Object.keys(params), ["name"])
    
    const p = {}
  
    p.name = params["name"]
    if (params["website"] != null) {
      p.website = params["website"]
    }

    super(p)
  }

  toJSON() {
    const o = {}

    o["name"] = this.name
    if (this.website != null) {
      o["website"] = this.website
    }
    
    return o
  }
}

class Attachment extends __.Immutable.Record({
  "id": undefined,
  "type": undefined,
  "url": undefined,
  "remoteUrl": undefined,
  "previewUrl": undefined,
  "textUrl": undefined,
}) {
  constructor(params) {
    __.hasRequired(Object.keys(params), ["id", "type"])
    
    const { Type } = Attachment
    const p = {}
  
    p.id = params["id"]
    p.type = Type.from(params["type"])
    if (params["url"] != null) {
      p.url = params["url"]
    }
    if (params["remote_url"] != null) {
      p.remoteUrl = params["remote_url"]
    }
    if (params["preview_url"] != null) {
      p.previewUrl = params["preview_url"]
    }
    if (params["text_url"] != null) {
      p.textUrl = params["text_url"]
    }

    super(p)
  }

  toJSON() {
    const o = {}

    o["id"] = this.id
    o["type"] = this.type.toJSON()
    if (this.url != null) {
      o["url"] = this.url
    }
    if (this.remoteUrl != null) {
      o["remote_url"] = this.remoteUrl
    }
    if (this.previewUrl != null) {
      o["preview_url"] = this.previewUrl
    }
    if (this.textUrl != null) {
      o["text_url"] = this.textUrl
    }
    
    return o
  }
}

Attachment.Type = new __.Enum(class Type {}, {
  "image": "image",
  "video": "video",
  "gifv": "gifv",
})

class Card extends __.Immutable.Record({
  "url": undefined,
  "title": undefined,
  "description": undefined,
  "image": undefined,
}) {
  constructor(params) {
    const p = {}
  
    if (params["url"] != null) {
      p.url = params["url"]
    }
    if (params["title"] != null) {
      p.title = params["title"]
    }
    if (params["description"] != null) {
      p.description = params["description"]
    }
    if (params["image"] != null) {
      p.image = params["image"]
    }

    super(p)
  }

  toJSON() {
    const o = {}

    if (this.url != null) {
      o["url"] = this.url
    }
    if (this.title != null) {
      o["title"] = this.title
    }
    if (this.description != null) {
      o["description"] = this.description
    }
    if (this.image != null) {
      o["image"] = this.image
    }
    
    return o
  }
}

class Error extends __.Immutable.Record({
  "error": undefined,
}) {
  constructor(params) {
    const p = {}
  
    if (params["error"] != null) {
      p.error = params["error"]
    }

    super(p)
  }

  toJSON() {
    const o = {}

    if (this.error != null) {
      o["error"] = this.error
    }
    
    return o
  }
}

class Instance extends __.Immutable.Record({
  "uri": undefined,
  "title": undefined,
  "description": undefined,
  "email": undefined,
}) {
  constructor(params) {
    const p = {}
  
    if (params["uri"] != null) {
      p.uri = params["uri"]
    }
    if (params["title"] != null) {
      p.title = params["title"]
    }
    if (params["description"] != null) {
      p.description = params["description"]
    }
    if (params["email"] != null) {
      p.email = params["email"]
    }

    super(p)
  }

  toJSON() {
    const o = {}

    if (this.uri != null) {
      o["uri"] = this.uri
    }
    if (this.title != null) {
      o["title"] = this.title
    }
    if (this.description != null) {
      o["description"] = this.description
    }
    if (this.email != null) {
      o["email"] = this.email
    }
    
    return o
  }
}

class Mention extends __.Immutable.Record({
  "url": undefined,
  "username": undefined,
  "acct": undefined,
  "id": undefined,
}) {
  constructor(params) {
    const p = {}
  
    if (params["url"] != null) {
      p.url = params["url"]
    }
    if (params["username"] != null) {
      p.username = params["username"]
    }
    if (params["acct"] != null) {
      p.acct = params["acct"]
    }
    if (params["id"] != null) {
      p.id = params["id"]
    }

    super(p)
  }

  toJSON() {
    const o = {}

    if (this.url != null) {
      o["url"] = this.url
    }
    if (this.username != null) {
      o["username"] = this.username
    }
    if (this.acct != null) {
      o["acct"] = this.acct
    }
    if (this.id != null) {
      o["id"] = this.id
    }
    
    return o
  }
}

class Notification extends __.Immutable.Record({
  "id": undefined,
  "type": undefined,
  "createdAt": undefined,
  "account": undefined,
}) {
  constructor(params) {
    __.hasRequired(Object.keys(params), ["id", "type", "created_at", "account"])
    
    const { Type } = Notification
    const p = {}
  
    p.id = params["id"]
    p.type = Type.from(params["type"])
    p.createdAt = params["created_at"]
    p.account = __.createModel(Account, params["account"])

    super(p)
  }

  toJSON() {
    const o = {}

    o["id"] = this.id
    o["type"] = this.type.toJSON()
    o["created_at"] = this.createdAt
    o["account"] = this.account.toJSON()
    
    return o
  }
}

Notification.Type = new __.Enum(class Type {}, {
  "mention": "mention",
  "reblog": "reblog",
  "favourite": "favourite",
  "follow": "follow",
})

class Relationships extends __.Immutable.Record({
  "following": undefined,
  "followedBy": undefined,
  "blocking": undefined,
  "muting": undefined,
  "requested": undefined,
}) {
  constructor(params) {
    const p = {}
  
    if (params["following"] != null) {
      p.following = params["following"]
    }
    if (params["followed_by"] != null) {
      p.followedBy = params["followed_by"]
    }
    if (params["blocking"] != null) {
      p.blocking = params["blocking"]
    }
    if (params["muting"] != null) {
      p.muting = params["muting"]
    }
    if (params["requested"] != null) {
      p.requested = params["requested"]
    }

    super(p)
  }

  toJSON() {
    const o = {}

    if (this.following != null) {
      o["following"] = this.following
    }
    if (this.followedBy != null) {
      o["followed_by"] = this.followedBy
    }
    if (this.blocking != null) {
      o["blocking"] = this.blocking
    }
    if (this.muting != null) {
      o["muting"] = this.muting
    }
    if (this.requested != null) {
      o["requested"] = this.requested
    }
    
    return o
  }
}

class Report extends __.Immutable.Record({
  "id": undefined,
  "actionTaken": undefined,
}) {
  constructor(params) {
    const p = {}
  
    if (params["id"] != null) {
      p.id = params["id"]
    }
    if (params["action_taken"] != null) {
      p.actionTaken = params["action_taken"]
    }

    super(p)
  }

  toJSON() {
    const o = {}

    if (this.id != null) {
      o["id"] = this.id
    }
    if (this.actionTaken != null) {
      o["action_taken"] = this.actionTaken
    }
    
    return o
  }
}

class Results extends __.Immutable.Record({
  "accounts": undefined,
  "statuses": undefined,
  "hashtags": undefined,
}) {
  constructor(params) {
    const p = {}
  
    if (params["accounts"] != null) {
      p.accounts = params["accounts"]
    }
    if (params["statuses"] != null) {
      p.statuses = params["statuses"]
    }
    if (params["hashtags"] != null) {
      p.hashtags = params["hashtags"]
    }

    super(p)
  }

  toJSON() {
    const o = {}

    if (this.accounts != null) {
      o["accounts"] = this.accounts
    }
    if (this.statuses != null) {
      o["statuses"] = this.statuses
    }
    if (this.hashtags != null) {
      o["hashtags"] = this.hashtags
    }
    
    return o
  }
}

class StatusRequest extends __.Immutable.Record({
  "status": undefined,
  "visibility": undefined,
  "inReplyToId": undefined,
  "mediaIds": undefined,
  "spoilerText": undefined,
  "sensitive": undefined,
}) {
  constructor(params) {
    __.hasRequired(Object.keys(params), ["status", "visibility"])
    
    const p = {}
  
    if (params["in_reply_to_id"] != null) {
      p.inReplyToId = params["in_reply_to_id"]
    }
    if (params["media_ids"] != null) {
      p.mediaIds = params["media_ids"]
    }
    if (params["spoiler_text"] != null) {
      p.spoilerText = params["spoiler_text"]
    }
    p.status = params["status"]
    if (params["sensitive"] != null) {
      p.sensitive = params["sensitive"]
    }
    p.visibility = Visibility.from(params["visibility"])

    super(p)
  }

  toJSON() {
    const o = {}

    if (this.inReplyToId != null) {
      o["in_reply_to_id"] = this.inReplyToId
    }
    if (this.mediaIds != null) {
      o["media_ids"] = this.mediaIds
    }
    if (this.spoilerText != null) {
      o["spoiler_text"] = this.spoilerText
    }
    o["status"] = this.status
    if (this.sensitive != null) {
      o["sensitive"] = this.sensitive
    }
    o["visibility"] = this.visibility.toJSON()
    
    return o
  }
}

class Status extends __.Immutable.Record({
  "id": undefined,
  "uri": undefined,
  "url": undefined,
  "account": undefined,
  "content": undefined,
  "createdAt": undefined,
  "reblogsCount": undefined,
  "favouritesCount": undefined,
  "spoilerText": undefined,
  "visibility": undefined,
  "mediaAttachments": undefined,
  "mentions": undefined,
  "tags": undefined,
  "inReplyToId": undefined,
  "inReplyToAccountId": undefined,
  "reblog": undefined,
  "reblogged": undefined,
  "favourited": undefined,
  "sensitive": undefined,
  "application": undefined,
}) {
  constructor(params) {
    __.hasRequired(Object.keys(params), ["id", "uri", "url", "account", "content", "created_at", "reblogs_count", "favourites_count", "spoiler_text", "visibility", "media_attachments", "mentions", "tags"])
    
    const p = {}
  
    p.id = params["id"]
    p.uri = params["uri"]
    p.url = params["url"]
    p.account = __.createModel(Account, params["account"])
    if (params["in_reply_to_id"] != null) {
      p.inReplyToId = params["in_reply_to_id"]
    }
    if (params["in_reply_to_account_id"] != null) {
      p.inReplyToAccountId = params["in_reply_to_account_id"]
    }
    if (params["reblog"] != null) {
      p.reblog = __.createModel(Status, params["reblog"])
    }
    p.content = params["content"]
    p.createdAt = params["created_at"]
    p.reblogsCount = params["reblogs_count"]
    p.favouritesCount = params["favourites_count"]
    if (params["reblogged"] != null) {
      p.reblogged = params["reblogged"]
    }
    if (params["favourited"] != null) {
      p.favourited = params["favourited"]
    }
    if (params["sensitive"] != null) {
      p.sensitive = params["sensitive"]
    }
    p.spoilerText = params["spoiler_text"]
    p.visibility = Visibility.from(params["visibility"])
    p.mediaAttachments = __.createModel([Attachment], params["media_attachments"])
    p.mentions = __.createModel([Mention], params["mentions"])
    p.tags = __.createModel([Tag], params["tags"])
    if (params["application"] != null) {
      p.application = __.createModel(Application, params["application"])
    }

    super(p)
  }

  toJSON() {
    const o = {}

    o["id"] = this.id
    o["uri"] = this.uri
    o["url"] = this.url
    o["account"] = this.account.toJSON()
    if (this.inReplyToId != null) {
      o["in_reply_to_id"] = this.inReplyToId
    }
    if (this.inReplyToAccountId != null) {
      o["in_reply_to_account_id"] = this.inReplyToAccountId
    }
    if (this.reblog != null) {
      o["reblog"] = this.reblog.toJSON()
    }
    o["content"] = this.content
    o["created_at"] = this.createdAt
    o["reblogs_count"] = this.reblogsCount
    o["favourites_count"] = this.favouritesCount
    if (this.reblogged != null) {
      o["reblogged"] = this.reblogged
    }
    if (this.favourited != null) {
      o["favourited"] = this.favourited
    }
    if (this.sensitive != null) {
      o["sensitive"] = this.sensitive
    }
    o["spoiler_text"] = this.spoilerText
    o["visibility"] = this.visibility.toJSON()
    o["media_attachments"] = this.mediaAttachments.map(x => x.toJSON())
    o["mentions"] = this.mentions.map(x => x.toJSON())
    o["tags"] = this.tags.map(x => x.toJSON())
    if (this.application != null) {
      o["application"] = this.application.toJSON()
    }
    
    return o
  }
}

class Tag extends __.Immutable.Record({
  "name": undefined,
  "url": undefined,
}) {
  constructor(params) {
    const p = {}
  
    if (params["name"] != null) {
      p.name = params["name"]
    }
    if (params["url"] != null) {
      p.url = params["url"]
    }

    super(p)
  }

  toJSON() {
    const o = {}

    if (this.name != null) {
      o["name"] = this.name
    }
    if (this.url != null) {
      o["url"] = this.url
    }
    
    return o
  }
}

const Visibility = new __.Enum(class Visibility {}, {
  "public": "public",
  "unlisted": "unlisted",
  "private": "private",
  "direct": "direct",
})
class OAuthResponse extends __.Immutable.Record({
  "id": undefined,
  "redirectUri": undefined,
  "clientId": undefined,
  "clientSecret": undefined,
}) {
  constructor(params) {
    const p = {}
  
    if (params["id"] != null) {
      p.id = params["id"]
    }
    if (params["redirect_uri"] != null) {
      p.redirectUri = params["redirect_uri"]
    }
    if (params["client_id"] != null) {
      p.clientId = params["client_id"]
    }
    if (params["client_secret"] != null) {
      p.clientSecret = params["client_secret"]
    }

    super(p)
  }

  toJSON() {
    const o = {}

    if (this.id != null) {
      o["id"] = this.id
    }
    if (this.redirectUri != null) {
      o["redirect_uri"] = this.redirectUri
    }
    if (this.clientId != null) {
      o["client_id"] = this.clientId
    }
    if (this.clientSecret != null) {
      o["client_secret"] = this.clientSecret
    }
    
    return o
  }
}

MastodonApi.models = {
  Account,
  Application,
  Attachment,
  Card,
  Error,
  Instance,
  Mention,
  Notification,
  Relationships,
  Report,
  Results,
  StatusRequest,
  Status,
  Tag,
  Visibility,
  OAuthResponse,
}

module.exports = MastodonApi

