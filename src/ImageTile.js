import React from 'react'
import { Dimensions, ImageBackground, TouchableHighlight, View, Text } from 'react-native'
import { Colors } from '../../../src/config/keys'
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
    const { item, index, selected, selectImage, selectedItemNumber, renderSelectedComponent, renderExtraComponent } =
      this.props
    if (!item) return null
    const { mediaType, duration = '' } = item
    return (
      <TouchableHighlight underlayColor='transparent' onPress={() => selectImage(index)}>
        <View style={{ position: 'relative', padding: 4 }}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              backgroundColor: selected
                ? Colors.ParalucentMedium
                : mediaType === 'video'
                ? 'rgba(130,124,124,0.5)'
                : null,
            }}
          >
            <ImageBackground
              style={{
                width: width / 4 + 15,
                height: width / 4 + 15,
              }}
              imageStyle={{
                borderRadius: 4,
                opacity: selected ? 0.8 : mediaType == 'video' ? 0.6 : 1,
              }}
              source={{ uri: item.uri }}
            >
              {selected && renderSelectedComponent && renderSelectedComponent(selectedItemNumber)}
              {renderExtraComponent && renderExtraComponent(item)}
            </ImageBackground>
            {mediaType == 'video' && (
              <View style={{ position: 'absolute', zIndex: 1 }}>
                <Icon name='SolidPlay' height={16} width={16} fill={Colors.White} style={{ alignSelf: 'center' }} />
              </View>
            )}
            {selected && renderSelectedComponent && renderSelectedComponent(selectedItemNumber)}
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

export default ImageTile
