import React from "react"
import ReactNative, {
  Text,
  View,
  TextInput,
  Button,
  Linking
} from "react-native-macos"
import { Provider } from "react-redux"

import store from "../store"
import * as actions from "../actions"
import { getToken, models } from "../api"
import qs from "querystring"

const clientId = "2dcab50fc2d55ac8d4804d4f9440703369c1fcc242e08ab3235acc1ca3c2b0dd"
const clientSecret = "84e094575c36f1086abadf49efa5ee381891c83c36771bddb74e6ef9a41f7ff0"
const redirectUrn = "urn:ietf:wg:oauth:2.0:oob"

function generateAuthUrl(username, host) {
  const url = `https://${host}/oauth/authorize`

  const params = {
    redirect_uri: redirectUrn,
    scope: "read write follow",
    response_type: "code",
    client_id: clientId
  }

  return `${url}?${qs.stringify(params)}`;
}

export default class Welcome extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      acct: "",
      code: "",
      username: "",
      host: "",
      urlOpened: false
    }
  }

  onLogInTapped() {
    let { username, host } = this.state
    const url = generateAuthUrl(username, host)

    Linking.openURL(url)

    this.setState({
      urlOpened: true
    })
  }

  onFinishTapped() {
    const { host, code } = this.state

    getToken(host, code).then(accessToken => {
      store.dispatch(actions.setAccessToken(host, accessToken))
    })
  }

  onInput(input) {
    if (this.state.urlOpened) {
      this.setState({ code: input })
      return
    }

    let acct = input
    
    if (acct.startsWith("@")) {
      acct = acct.substring(1)
    }

    const [username, host] = acct.split("@", 2)

    this.setState({
      acct: input,
      username,
      host
    })
  }

  renderCodeEntry() {
    return (
      <View style={styles.container}>
        <Button 
            bezelStyle="rounded" 
            style={[styles.button, { position: "absolute", top: 40, left: 4 }]} 
            onClick={() => this.setState({ urlOpened: false })} 
            title="Go back" />
        <Text style={styles.welcomeHeading}>Paste the code below.</Text>
        <Text style={styles.inputLabel}>The code will appear on the webpage you just logged into.</Text>
        <View>
          <TextInput
              style={styles.inputField}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={this.onInput.bind(this)}
              value={this.state.code} />
        </View>
        <Button onClick={this.onFinishTapped.bind(this)} bezelStyle="rounded" style={styles.button} title="Finish" />
        </View>
    )
  }

  renderWelcome() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcomeHeading}>Welcome! Log into Sax</Text>
        <Text style={styles.inputLabel}>Enter your account details in @username@server format.</Text>
        <View>
          <TextInput
              style={styles.inputField}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={this.onInput.bind(this)}
              value={this.state.acct} />
        </View>
        <Button onClick={this.onLogInTapped.bind(this)} bezelStyle="rounded" style={styles.button} title="Log in"  />
      </View>
    )
  }

  render() {
    if (this.state.urlOpened) {
      return this.renderCodeEntry()
    } else {
      return this.renderWelcome()
    }
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f0f6cd",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  welcomeHeading: {
    color: "#333",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 32
  },
  inputLabel: {
    color: "#333",
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 8
  },
  inputField: {
    height: 26,
    borderWidth: 0.5,
    borderColor: '#0f0f0f',
    width: 300,
    fontSize: 13
  },
  button: {
    height: 32,
    width: 100,
    margin: 15
  }
}