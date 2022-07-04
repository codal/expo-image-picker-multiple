import React from 'react'
import { Dimensions, ImageBackground, TouchableHighlight, View, Text } from 'react-native'
import { Colors } from '../../../src/config/keys'
import { styles } from '../../../src/views/PostCard/styles'
import Icon from '../../../src/components/icons/Icon'

const { width } = Dimensions.get('window')
const renderTime = (value) => {
  const sec = parseInt(value, 10) // convert value to number if it's string
  let hours = Math.floor(sec / 3600) // get hours
  let minutes = Math.floor((sec - hours * 3600) / 60) // get minutes
  let seconds = sec - hours * 3600 - minutes * 60 //  get seconds
  // add 0 if value < 10; Example: 2 => 02
  if (hours < 10) {
    hours = '0' + hours
  }
  if (minutes < 10) {
    minutes = '0' + minutes
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }

  return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`
}

class ImageTile extends React.PureComponent {
  render() {
    const {
      item,
      index,
      selected,
      selectImage,
      selectedItemNumber,
      renderSelectedComponent,
      renderExtraComponent,
      itemdata,
    } = this.props
    if (!item) return null
    const { mediaType, duration = '' } = item

    return (
      <TouchableHighlight
        underlayColor='transparent'
        style={{ flex: 1, overflow: 'hidden', borderRadius: 4 }}
        onPress={() => selectImage(itemdata)}
      >
        <ImageBackground
          style={{ width: width / 2 - 20, height: width / 2 - 10 }}
          source={{ uri: item.uri }}
          imageStyle={{
            borderRadius: 4,
            opacity: selected ? 0.8 : 1,
          }}
        >
          {renderExtraComponent && renderExtraComponent(item)}
        </ImageBackground>
      </TouchableHighlight>
    )
  }
}

export default ImageTile
