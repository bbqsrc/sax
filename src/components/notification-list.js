import React from 'react'
import ReactNative, {
  View,
  ListView,
  RecyclerViewBackedScrollView
} from 'react-native-macos'
import * as actions from "../actions"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import Notification from "./notification"

class NotificationListView extends React.Component {
  constructor(props) {
    super(props)

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    })
    
    this.state = {
      dataSource: ds.cloneWithRows(props.notifications),
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(newProps.notifications)
    })
  }

  _renderSeparator(sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
    return (
      <View
        key={`${sectionID}-${rowID}`}
        style={{
          height: adjacentRowHighlighted ? 4 : 1,
          backgroundColor: '#d6d7da'
        }}
      />
    );
  }

  render() {
    return <ListView
      renderScrollComponent={props => <RecyclerViewBackedScrollView {...props} />}
      renderSeparator={this._renderSeparator}
      enableEmptySections={true}
      dataSource={this.state.dataSource}
      renderRow={(rowData) => <Notification notification={rowData} {...this.props} />}
    />
  }
}

const bind = (thing, stateFunc) => {
	return connect(
		stateFunc,
		(dispatch) => ({ actions: bindActionCreators(actions, dispatch) })
	)(thing)
}

export default bind(NotificationListView, (state) => ({ notifications: state.notifications }))
