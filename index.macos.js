import React from 'react'
import ReactNative, {
  AppRegistry
} from 'react-native-macos'

import TimelineService from "./src/services/timeline"
import App from "./src/containers/app"

const timelineService = new TimelineService()

AppRegistry.registerComponent('Sax', () => App)
