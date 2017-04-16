import React from "react"
import ReactNative, { Linking } from "react-native-macos"
import moment from "moment"

import url from "url"
import api from "../api"
import parseHtml from "../utilities/status-html-parser"

const {
  AppRegistry,
  StyleSheet,
  Button,
  Text,
  View,
  ListView,
  Image,
  TouchableHighlight,
  WebView
} = ReactNative

function fromNow(date) {
  const m = moment(date)

  if (m.diff(moment(), "days") < 0) {
    return m.format("YYYY-MM-DD")
  }

  return m.fromNow()
}

export default
class StatusView extends React.Component {
  render() {
    const { status } = this.props

    let extraMessage

    if (status.reblog) {
      extraMessage = <Text style={[styles.secondaryLabel, { marginTop: 4 }]}>Boosted by {status.account.displayName}</Text>
    }

    const creator = status.reblog ? status.reblog.account : status.account
    const avatarUrl = url.resolve(api.baseUrl, creator.avatar || "/avatars/original/missing.png")

    return (
      <View style={styles.border}>
        <Image source={{ uri: avatarUrl }} style={{ height: 48, width: 48, borderRadius: 4 }}/>
        
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusHeaderItem, styles.primaryLabel]}>{creator.displayName}</Text>
            <Text style={[styles.statusHeaderItem, styles.secondaryLabel]}>@{creator.acct}</Text>
            <Text style={styles.dateLabel}>{fromNow(status.createdAt)}</Text>
          </View>

          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flex: 1, flexDirection: "column" }}>
              <View style={styles.statusContainer}>
                {parseHtml(styles.statusLabel, status.reblog ? status.reblog.content : status.content)}
              </View>
              {extraMessage}
            </View>
            <View style={styles.buttonColumn}>
              <TouchableHighlight style={styles.replyButton} onPress={this.reply.bind(this)}>
                <Image source={require("../images/reply.png")} style={styles.icon} />
              </TouchableHighlight>
              <TouchableHighlight style={this.boostStyle} onPress={this.boost.bind(this)}>
                <Image source={require("../images/retweet.png")} style={[styles.icon, { marginBottom: 4 }]} />
              </TouchableHighlight>
              <TouchableHighlight style={this.favouriteStyle} onPress={this.favourite.bind(this)}>
                <Image source={require("../images/star.png")} style={styles.icon} />
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </View>
    )
  }

  reply() {

  }

  boost() {
    const { status, actions } = this.props

    let res

    if (status.reblogged) {
      res = api.unreblog({ id: status.id })
    } else {
      res = api.reblog({ id: status.id })
    }
    
    res.then(status => {
      actions.updateStatus(status)
    }).catch(alert)
  }

  favourite() {
    const { status, actions } = this.props

    let res

    if (status.favourited) {
      res = api.unfavourite({ id: status.id })
    } else {
      res = api.favourite({ id: status.id })
    }

    res.then(status => {
      actions.updateStatus(status)
    }).catch(alert)
  }

  get boostStyle() {
    const { status } = this.props

    if (status.reblogged) {
      return styles.boostActive
    }

    return styles.boostInactive
  }

  get favouriteStyle() {
    const { status } = this.props

    if (status.favourited) {
      return styles.favActive
    }

    return styles.favInactive
  }
}

const styles = {
  statusContainer: {
  },

  favActive: {
    opacity: 1.0
  },

  favInactive: {
    opacity: 0.5
  },

  boostActive: {
    opacity: 1.0
  },
  
  boostInactive: {
    opacity: 0.5
  },

  replyButton: {
    opacity: 0.5
  },

  icon: {
    height: 20,
    width: 20,
    tintColor: "#ff0000",
    marginBottom: 2
  },

  buttonColumn: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: 20,
    marginLeft: 8
  },

  statusHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 4
  },

  statusHeaderItem: {
    marginRight: 8
  },

  border: {
    backgroundColor: "white",
    flexDirection: "row",
    padding: 8,
    paddingBottom: 12
  },

  primaryLabel: {
    fontWeight: "600",
    fontSize: 12
  },

  secondaryLabel: {
    fontWeight: "600",
    color: "#777",
    fontSize: 12
  },

  dateLabel: {
    flex: 1,
    textAlign: "right",
    fontSize: 11
  },

  statusLabel: {
    fontSize: 13,
    color: "#111"
  }
}