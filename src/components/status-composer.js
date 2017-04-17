import React from "react"
import {
  View,
  TextInput,
  Text
} from "react-native-macos"

import { bindActionCreators } from "redux"
import { connect } from "react-redux"

import store from "../store"
import * as actions from "../actions"
import { models } from "../generated/api"
import api from "../api"

class StatusComposer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      input: props.statusInput
    }
  }

  onInput(text) {
    const input = text.replace(/\u2028/mg, "\n").replace(/\u2029/mg, "\n\n")

    this.setState({ input })
  }

  onSubmit() {
    const { replyTo, actions } = this.props
    const inReplyToId = replyTo ? replyTo.id : null
    const visibility = replyTo ? replyTo.visibility.toJSON() : "public"

    const body = new models.StatusRequest({
      status: this.state.input,
      visibility,
      in_reply_to_id: inReplyToId
    })

    api.postStatus({ body })
      .then(status => {
        this.setState({
          input: ""
        })

        actions.replyTo(null)
        actions.setStatusInput("")
      })
  }

  componentWillReceiveProps(newProps) {
    if (newProps.statusInput != this.props.statusInput) {
      this.setState({
        input: newProps.statusInput
      })
    }
  }

  componentDidMount() {
    this.setState({ input: this.props.statusInput })
  }

  componentWillUnmount() {
    store.dispatch(actions.setStatusInput(this.state.input))
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

export default connect(
  (state) => ({
      replyTo: state.replyTo,
      statusInput: state.statusInput
  }),
  (dispatch) => ({ actions: bindActionCreators(actions, dispatch) })
)(StatusComposer)

const styles = {
  counterLabel: {
    position: "absolute",
    bottom: 4,
    right: 4,
    color: "#999",
    fontSize: 13,
    fontWeight: "600"
  }
}