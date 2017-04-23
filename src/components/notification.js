import React from "react"
import ReactNative, { Linking } from "react-native-macos"
import moment from "moment"

import url from "url"
import parseHtml from "../utilities/status-html-parser"
import store from "../store"
import api from "../api"

import StatusView from "./status"
import { star, boost } from "../images"

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
class NotificationView extends React.Component {
  renderResponse(type) {
    const { notification } = this.props
    const creator = notification.account
    //const avatarUrl = url.resolve(api.baseUrl, creator.avatar || "/avatars/original/missing.png")

    const image = type === "reblog" ? boost : star

    return (
      <View style={styles.border}>
        <View style={{ flex: 1, flexDirection: "column" }}>
          <View style={[styles.statusHeader, { marginLeft: 16, marginBottom: 8 }]}>
            <Image source={image} style={[styles.icon, { marginBottom: 0, marginRight: 4 }]} />
            <Text>
                <Text style={[styles.statusHeaderItem, styles.primaryLabel]}>{creator.displayName.trim() || creator.acct}</Text>
                <Text style={[styles.statusHeaderItem, styles.secondaryLabel]}> {type === "reblog" ? "boosted" : "starred"} a toot</Text>
            </Text>
            <Text style={styles.dateLabel}>{fromNow(notification.createdAt)}</Text>
          </View>

          <StatusView status={notification.status} inset={true} />
        </View>

        
      </View>
    )
  }

  renderFollow() {
    const { notification } = this.props
    const creator = notification.account
    const avatarUrl = url.resolve(api.baseUrl, creator.avatar || "/avatars/original/missing.png")

    return (
      <View style={styles.border}>
        <Image source={{ uri: avatarUrl }} style={{ marginLeft: 16, height: 40, width: 40, borderRadius: 4 }}/>
        
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.statusHeader}>
            <Text>
                <Text style={[styles.statusHeaderItem, styles.primaryLabel]}>{creator.displayName}</Text>
                <Text style={[styles.statusHeaderItem, styles.secondaryLabel]}> followed you</Text>
            </Text>
            <Text style={styles.dateLabel}>{fromNow(notification.createdAt)}</Text>
          </View>

          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={[styles.statusHeaderItem, styles.secondaryLabel]}>@{creator.acct}</Text>
          </View>
        </View>
      </View>
    )
  }

  render() {
    const { notification } = this.props

    switch (notification.type.value) {
    case "mention":
        console.log(JSON.stringify(notification, null, 2))
        return <StatusView status={notification.status} {...this.props} />
    case "reblog":
        return this.renderResponse("reblog")
    case "favourite":
        return this.renderResponse("favourite")
    case "follow":
        return this.renderFollow()
    default:
        console.log("wtf")
        console.log(JSON.stringify(notification, null, 2))
        console.error(notification.type)
    }
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
    alignItems: "center",
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