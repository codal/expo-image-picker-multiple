import React from 'react'
import { Dimensions, ImageBackground, TouchableHighlight, View, ActivityIndicator } from 'react-native'
import { Colors } from '../../../src/config/keys'
import Icon from '../../../src/components/icons/Icon'

const { width } = Dimensions.get('window')

class ImageTile extends React.PureComponent {
  state = {
    loader: false
  }
  render() {
    const { item, index, selected, selectImage, selectedItemNumber, renderSelectedComponent, renderExtraComponent } =
      this.props
    if (!item) return null
    const { mediaType } = item
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
              {selected && renderSelectedComponent && renderSelectedComponent(selectedItemNumber)}
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
