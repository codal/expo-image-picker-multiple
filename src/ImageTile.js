import React from 'react';
import {
  Dimensions,
  ImageBackground,
  TouchableHighlight,
  View,
  Text
} from 'react-native';

const {width} = Dimensions.get('window');
const renderTime = (value) => {
    const sec = parseInt(value, 10); // convert value to number if it's string
      let hours   = Math.floor(sec / 3600); // get hours
      let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
      let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
      // add 0 if value < 10; Example: 2 => 02
      if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}
  
    return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`
  }
class ImageTile extends React.PureComponent {
  render() {
    const { item, index, selected, selectImage, selectedItemNumber, renderSelectedComponent, renderExtraComponent } = this.props;
    if (!item) return null;
    const { mediaType, duration = '' } = item
    return (
      <TouchableHighlight
        underlayColor='transparent'
        onPress={() => selectImage(index)} >
        <View style={{ position: 'relative' }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ImageBackground
              style={{ width: width / 4, height: width / 4 }}
              source={{ uri: item.uri }} >
              {selected && renderSelectedComponent && renderSelectedComponent(selectedItemNumber)}
              {renderExtraComponent && renderExtraComponent(item)}
            </ImageBackground>
            {!selected && mediaType == 'video' && (
              <View style={{position: 'absolute', right: 5,bottom: 5, zIndex: 1}}>
              <Text style={{color: '#fff', fontSize: 14, fontWeight: '600'}}>{renderTime(duration)}</Text>
              </View>
            )}
            {selected && renderSelectedComponent && renderSelectedComponent(selectedItemNumber)}
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

export default ImageTile;
