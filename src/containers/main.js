import React from "react"
import RCTDeviceEventEmitter from "RCTDeviceEventEmitter"
import ReactNative, {
  StyleSheet,
  View
} from "react-native-macos"

import {
  UserTimelineListView,
  LocalTimelineListView,
  FederatedTimelineListView
} from "../components/status-list" 
import NotificationsListView from "../components/notification-list"

import StatusComposer from "../components/status-composer"
import TimelineService from "../services/timeline"

export default class Main extends React.Component {
  constructor(props) {
    super(props)

    this.timelineService = new TimelineService(props.host, props.accessToken)

    this.state = {
      selected: 0,
      showInputField: false
    }
  }

  componentDidMount() {
    RCTDeviceEventEmitter.addListener(
      "onTabSelected",
      (e) => this.updateSelectedView(e.selected)
    )

    RCTDeviceEventEmitter.addListener(
      "onNewMessageButtonTapped",
      () => this.newMessage()
    )
  }

  componentWillReceiveProps(newProps) {
    if (newProps.replyTo) {
      this.setState({ showInputField: true })
    }
  }

  newMessage() {
    this.setState({
      showInputField: !this.state.showInputField
    })
  }

  updateSelectedView(index) {
    this.setState({
      selected: index
    })
  }

  get selectedView() {
    const { selected } = this.state
    
    switch (selected) {
    case 0:
      return <UserTimelineListView />
    case 1:
      return <NotificationsListView />
    case 2:
      return <LocalTimelineListView />
    case 3:
      return <FederatedTimelineListView />
    }
  }

  render() {
    const { state } = this.props

    let inputField

    if (this.state.showInputField) {
      inputField = <StatusComposer />
    }
    
    return (
      <View style={styles.container}>
        {inputField}
        {this.selectedView}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
    paddingTop: 38
  }
})