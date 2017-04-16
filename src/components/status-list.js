import React from 'react'
import ReactNative, {
  View,
  ListView,
  RecyclerViewBackedScrollView
} from 'react-native-macos'
import * as actions from "../actions"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import Status from "./status"
import StatusStreamReader from "../utilities/status-stream-reader"
import api from "../api"

class StatusListView extends React.Component {
  constructor(props) {
    super(props)

    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    })
    
    this.state = {
      dataSource: ds.cloneWithRows(props.statuses),
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(newProps.statuses)
    })
  }

  _renderSeparator(sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
    return (
      <View
        key={`${sectionID}-${rowID}`}
        style={{
          height: adjacentRowHighlighted ? 4 : 1,
          backgroundColor: '#ddd'
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
      renderRow={(rowData) => <Status status={rowData} {...this.props} />}
    />
  }
}

const bind = (thing, stateFunc) => {
	return connect(
		stateFunc,
		(dispatch) => ({ actions: bindActionCreators(actions, dispatch) })
	)(thing)
}

const UserTimelineListView = bind(
	class UserTimelineListView extends StatusListView {},
  (state) => ({ statuses: state.statuses.home })
)

const LocalTimelineListView = bind(
	class LocalTimelineListView extends StatusListView {},
  (state) => ({ statuses: state.statuses.local })
)

const FederatedTimelineListView = bind(
	class FederatedTimelineListView extends StatusListView {},
  (state) => ({ statuses: state.statuses.federated })
)

export { UserTimelineListView, LocalTimelineListView, FederatedTimelineListView }
