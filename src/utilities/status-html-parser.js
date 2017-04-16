import htmlparser from "htmlparser2-without-node-native"
import React from "react"
import { Linking, Text, TextInput, TouchableHighlight } from "react-native-macos"

function textView(style, text, key) {
  return <Text key={key} selectable={true} style={style}>{text}</Text>
}

function linkView(style, href, text, key) {
  return <Text key={key} selectable={true} style={[style, { color: "#0073ae" }]} onPress={() => Linking.openURL(href)}>{text}</Text>
}

export default function parseStatusHtml(style, content) {
  let view = []
  let text = ""

  let href = null

  const parser = new htmlparser.Parser({
    onopentag: (tag, attrs) => {
      if (tag === "br") {
        text += "\n"  
      }

      if (tag === "a") {
        if (text !== "") {
          view.push({ text })
          text = ""
        }

        href = attrs.href
      }
    },
    onclosetag: (tag) => {
      if (tag === "p") {
        text += "\n\n"
      }

      if (tag === "a") {
        view.push({ href, text })
        text = ""
        href = null
      }
    },
    ontext: (t) => {
      text += t
    }
  }, { decodeEntities: true })

  parser.write(content)
  parser.end()

  if (text !== "") {
    view.push({ text })
  }

  const out = view.map((data, i) => {
    if (data.href) {
      return linkView(style, data.href, data.text, i)
    } else {
      return textView(style, data.text, i)
    }
  })

  return out
}