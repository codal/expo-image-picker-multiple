import React from 'react'
import { Dimensions, ImageBackground, TouchableHighlight, ActivityIndicator, View } from 'react-native'

const { width } = Dimensions.get('window')

class ImageTile extends React.PureComponent {
  state = {
    loader: false
  }
  render() {
    const {
      item,
      selected,
      selectImage,
      renderExtraComponent,
      itemdata,
    } = this.props

    if (!item) return null


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
          onLoadStart={() => {
            this.setState({
              loader: true
            })
          }}
          onLoadEnd={() => {
            this.setState({
              loader: false
            })
          }}
        >
          {renderExtraComponent && renderExtraComponent(item)}
          {this.state.loader ? <View style={{
            position: 'absolute',
            top: '40%',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10
          }}>
            <ActivityIndicator size={'large'} /></View> : null}
        </ImageBackground>
      </TouchableHighlight>
    )
  }
}

export default ImageTile
