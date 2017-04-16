import React from 'react'
import RCTDeviceEventEmitter from 'RCTDeviceEventEmitter'
import ReactNative, {
  AppRegistry,
  StyleSheet,
  Button,
  Text,
  View,
  ListView,
  TextInput,
  RecyclerViewBackedScrollView
} from 'react-native-macos'
import { Provider } from "react-redux"

import {
  UserTimelineListView,
  LocalTimelineListView,
  FederatedTimelineListView
} from "../components/status-list" 

import store from "../store"
import * as actions from "../actions"
import {models} from "../generated/api"
import api from "../api"

class StatusInputField extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      input: ""
    }
  }

  onInput(text) {
    const input = text.replace(/\u2028/mg, "\n").replace(/\u2029/mg, "\n\n")

    this.setState({ input })
  }

  onSubmit() {
    const body = new models.StatusRequest({
      status: this.state.input,
      visibility: "public"
    })

    api.postStatus({ body })
      .then(status => {
        this.setState({
          input: ""
        })
      })
      .catch(error => {
        alert(error.message)
      })
  }

  render() {
    return (
      <View>
        <TextInput
            style={{ height: 80, fontSize: 14 }}
            onChangeText={this.onInput.bind(this)}
            onSubmitEditing={this.onSubmit.bind(this)}
            value={this.state.input}
        />
        <Text style={styles.counterLabel}>{this.limitCounter}</Text>
      </View>
    )
  }

  get limitCounter() {
    return 500 - this.state.input.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "_").length
  }
}

class Sax extends React.Component {
  constructor(props) {
    super(props)

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
      //return <NotificationsListView />
      return <View />
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
      inputField = <StatusInputField />
    }
    
    return (
      <View style={styles.container}>
        {inputField}
        {this.selectedView}
      </View>
    )
  }
}

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Sax />
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
    paddingTop: 38
  },

  counterLabel: {
    position: "absolute",
    bottom: 4,
    right: 4,
    color: "#999",
    fontSize: 13,
    fontWeight: "600"
  }
})
