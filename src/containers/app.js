import React from "react"
import ReactNative, {
  AsyncStorage,
  Text
} from "react-native-macos"
import { Provider, connect } from "react-redux"
import { bindActionCreators } from "redux"

import Welcome from "./welcome"
import Main from './main'

import store from "../store"
import * as actions from "../actions"
import API, { models } from "../api"

const ACCESS_TOKEN = "ACCESS_TOKEN"

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    AsyncStorage.getItem(ACCESS_TOKEN).then(token => {
      if (token) {
        const { host, accessToken } = JSON.parse(token)
        store.dispatch(actions.setAccessToken(host, accessToken))
      }
      
      this.setState({
        loading: false
      })
    })
  }

  get currentView() {
    if (this.state.loading) {
      return <Text>Loading…</Text>
    }

    if (this.props.accessToken == null) {
      return <Welcome {...this.props} />
    } else {
      return <Main {...this.props} />
    }
  }

  render() {
    return this.currentView
  }
}

const WrappedApp = connect(
  (state) => ({ accessToken: state.accessToken, statusInput: state.statusInput, replyTo: state.replyTo }),
  (dispatch) => ({ actions: bindActionCreators(actions, dispatch) })
)(App)

class Sax extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <WrappedApp />
      </Provider>
    )
  }
}

export default Sax

