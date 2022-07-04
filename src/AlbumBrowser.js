import React from 'react'
import { StyleSheet, View, FlatList, Dimensions, ActivityIndicator, Text } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import * as MediaLibrary from 'expo-media-library'
import * as Permissions from 'expo-permissions'
import ImageTile from './ImageTile'
import ImageAlbumTile from './ImageAlbumTile'
import { getAlbumAsync, getAlbumsAsync, getAssetsAsync } from 'expo-media-library/src/MediaLibrary'
import TextStyles from '@components/micro/TextStyles'
import { Colors, Measurement } from '@config/keys'
import Icon from '@components/icons/Icon'
import { Fonts } from '../../../src/config/keys'

const { width } = Dimensions.get('window')

export default class AlbumBrowser extends React.Component {
  static defaultProps = {
    loadCompleteMetadata: false,
    loadCount: 50,
    emptyStayComponent: null,
    preloaderComponent: <ActivityIndicator size='large' />,
    mediaType: [MediaLibrary.MediaType.photo],
  }

  state = {
    hasCameraPermission: null,
    hasCameraRollPermission: null,
    numColumns: null,
    photos: [],
    selected: [],
    selectedWithAlbum: [],
    selectedAlbum: {},
    isEmpty: false,
    after: null,
    hasNextPage: true,
    isAlbumList: true,
    albumList: [],
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    console.log('Component is receiving new props', newProps.inDetailAlbum)
    if (newProps.inDetailAlbum !== undefined && !newProps.inDetailAlbum) {
      this.setState({ isAlbumList: true, after: null, hasNextPage: true, photos: [], isEmpty: false, selected: [] })
    }
  }

  async componentDidMount() {
    await this.getPermissionsAsync()
    ScreenOrientation.addOrientationChangeListener(this.onOrientationChange)
    const orientation = await ScreenOrientation.getOrientationAsync()
    const numColumns = this.getNumColumns(orientation)
    this.setState({ numColumns })
    this.getPhotos()
  }

  getPermissionsAsync = async () => {
    const { status: camera } = await Permissions.askAsync(Permissions.CAMERA)
    const { status: cameraRoll } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY)
    this.setState({
      hasCameraPermission: camera === 'granted',
      hasCameraRollPermission: cameraRoll === 'granted',
    })
  }

  onOrientationChange = ({ orientationInfo }) => {
    ScreenOrientation.removeOrientationChangeListeners()
    ScreenOrientation.addOrientationChangeListener(this.onOrientationChange)
    const numColumns = this.getNumColumns(orientationInfo.orientation)
    this.setState({ numColumns })
  }

  getNumColumns = (orientation) => {
    const { PORTRAIT_UP, PORTRAIT_DOWN } = ScreenOrientation.Orientation
    const isPortrait = orientation === PORTRAIT_UP || orientation === PORTRAIT_DOWN
    return isPortrait ? 3 : 6
  }

  selectImageAlbum = (item) => {
    this.setState({ isAlbumList: false }, () => {
      this.props.setInDetailAlbum(true)
      this.setState({
        selectedAlbum: item,
      })
      this.getPhotosDetail(item)
    })
  }

  selectImage = (index) => {
    // let newSelected = Array.from(this.state.selected)
    // if (newSelected.indexOf(index) === -1) {
    //   newSelected.push(index)
    // } else {
    //   const deleteIndex = newSelected.indexOf(index)
    //   newSelected.splice(deleteIndex, 1)
    // }
    // if (newSelected.length > this.props.max) {
    //   this.props.onMaximumSelection?.()
    //   return
    // }
    // if (!newSelected) newSelected = []
    // alert(JSON.stringify(newSelected))
    // this.setState({ selected: newSelected }, () => {
    //   this.props.onChange(newSelected.length, () => this.prepareCallback())
    // })

    let newSelected = Array.from(this.state.selectedWithAlbum)
    let value = this.state.selectedWithAlbum.find((v) => v.id === this.state.selectedAlbum.id && v.index === index)
    if (!value) {
      newSelected.push({
        index,
        id: this.state.selectedAlbum.id,
        photo: this.state.photos[index],
      })
    } else {
      const deleteIndex = newSelected.indexOf(value)
      newSelected.splice(deleteIndex, 1)
    }

    if (newSelected.length > this.props.max) {
      this.props.onMaximumSelection?.()
      return
    }

    this.setState({ selectedWithAlbum: newSelected }, () => {
      this.props.onChange(newSelected.length, () => this.prepareCallback())
    })
    // let newSelected = Array.from(this.state.selected)
  }

  getPhotosDetail = async (item) => {
    const params = {
      first: this.props.loadCount,
      mediaType: this.props.mediaType,
      album: item.getPhotos,
      sortBy: [MediaLibrary.SortBy.creationTime],
    }
    if (this.state.after) params.after = this.state.after
    if (!this.state.hasNextPage) return
    MediaLibrary.getAssetsAsync(params).then(this.processPhotos)
  }

  getPhotos = () => {
    const params = {
      first: this.props.loadCount,
      mediaType: this.props.mediaType,
      sortBy: [MediaLibrary.SortBy.creationTime],
    }
    if (this.state.after) params.after = this.state.after
    if (!this.state.hasNextPage) return
    MediaLibrary.getAlbumsAsync().then(this.processPhotos)
  }

  getPhotosSingle = async (data, index) => {
    const getPhotos = await MediaLibrary.getAlbumAsync(data.title)
    if (getPhotos) {
      const params = {
        first: 1,
        album: getPhotos,
        mediaType: this.props.mediaType,
        sortBy: [MediaLibrary.SortBy.creationTime],
      }

      const getAlbum = await MediaLibrary.getAssetsAsync(params)

      MediaLibrary.getAssetsAsync(params).then((res) => {
        data.assets = res.assets
        data.getPhotos = getPhotos
        const value = this.state.albumList
        value[index] = data
        this.setState({
          albumList: value,
        })
      })
    }
  }

  processPhotos = (data) => {
    if (!this.state.isAlbumList) {
      if (data.totalCount) {
        if (this.state.after === data.endCursor) return
        const uris = data.assets
        this.setState({
          photos: [...this.state.photos, ...uris],
          after: data.endCursor,
          hasNextPage: data.hasNextPage,
        })
      } else {
        this.setState({ isEmpty: true })
      }
    } else {
      this.setState({ isEmpty: true })
      data = data.filter((i) => i.assetCount > 1)
      this.setState({ albumList: data })
      // this.getPhotosSingle({"assetCount":88,"title":"Screenshots","type":null,"id":"-1313584517"}, 0)
      for (let i = 0; i < data.length; i++) {
        this.getPhotosSingle(data[i], i)
      }
    }
  }

  getItemLayout = (data, index) => {
    const length = width / 4
    return { length, offset: length * index, index }
  }

  prepareCallback() {
    const { loadCompleteMetadata } = this.props
    const { selected, selectedWithAlbum, photos } = this.state
    const selectedPhotos = selectedWithAlbum.map((i, index) => selectedWithAlbum[index].photo)
    if (!loadCompleteMetadata) {
      this.props.callback(Promise.all(selectedPhotos))
    } else {
      const assetsInfo = Promise.all(selectedPhotos.map((i) => MediaLibrary.getAssetInfoAsync(i)))
      this.props.callback(assetsInfo)
    }
  }

  renderImageTile = ({ item, index }) => {
    let selected = false
    let selectedItemNumber = 0
    const valueNewIndex = this.state.selectedWithAlbum.findIndex(
      (item) => item.index === index && item.id === this.state.selectedAlbum.id
    )
    if (valueNewIndex !== -1) {
      selected = true
      selectedItemNumber = valueNewIndex + 1
    }

    return (
      <ImageTile
        selectedItemNumber={selectedItemNumber}
        item={item}
        index={index}
        selected={selected}
        selectImage={this.selectImage}
        renderSelectedComponent={this.props.renderSelectedComponent}
        renderExtraComponent={this.props.renderExtraComponent}
      />
    )
  }

  renderList = ({ item, index }) => {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: width / 2 - 15, height: width / 2 - 15, padding: 4 }}>
          <View style={{ flex: 1 }}>
            {(item.assets && item.assets.length > 0 && (
              <ImageAlbumTile
                selectedItemNumber={0}
                item={item.assets[0]}
                itemdata={item}
                index={0}
                selected={false}
                selectImage={this.selectImageAlbum}
                renderSelectedComponent={this.props.renderSelectedComponent}
                renderExtraComponent={this.props.renderExtraComponent}
                isSelectedOff={true}
              />
            )) ||
              null}
          </View>
        </View>
        <View
          style={{
            width: width / 2 - 15,
            height: width / 8,
            paddingHorizontal: 8,
            paddingTop: 6,
            flexDirection: 'row',
          }}
        >
          <View style={{ width: 82 }}>
            <Text style={styles.titletext} numberOfLines={2}>
              {item?.title}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <Text
            style={{
              ...TextStyles.mediumText,
              fontWeight: 'bold',
              color: Colors.Gray3,
            }}
          >
            {item?.assetCount}
          </Text>
        </View>
      </View>
    )
  }
  renderPreloader = () => this.props.preloaderComponent

  renderEmptyStay = () => this.props.emptyStayComponent

  renderFooter = () => {
    return <View style={{ width: '100%', height: 150 }} />
  }
  renderImages() {
    return (
      <FlatList
        data={this.state.photos}
        numColumns={3}
        key={2}
        renderItem={this.renderImageTile}
        keyExtractor={(_, index) => index}
        ListFooterComponent={this.renderFooter}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          this.state.isEmpty ? (
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.White,
                paddingHorizontal: Measurement.AppLevelContentSpacing,
                alignItems: 'center',
                paddingTop: 70,
              }}
            >
              <Icon name='NoResultsShapes' height={60} width={200}></Icon>
              <Text
                style={{
                  fontSize: 18,
                  color: Colors.Gray3,
                  fontFamily: Fonts.Medium,
                  marginTop: 16,
                }}
              >
                No Photos Found
              </Text>
            </View>
          ) : (
            this.renderPreloader()
          )
        }
        initialNumToRender={24}
        getItemLayout={this.getItemLayout}
      />
    )
  }

  renderAlbum() {
    return (
      <FlatList
        data={this.state.albumList}
        numColumns={2}
        key={this.state.numColumns}
        renderItem={this.renderList}
        keyExtractor={(_, index) => index}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          this.state.isEmpty ? (
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.White,
                paddingHorizontal: Measurement.AppLevelContentSpacing,
                alignItems: 'center',
                paddingTop: 70,
              }}
            >
              <Icon name='NoResultsShapes' height={60} width={200}></Icon>
              <Text
                style={{
                  fontSize: 18,
                  color: Colors.Gray3,
                  fontFamily: Fonts.Medium,
                  marginTop: 16,
                }}
              >
                No Albums Found
              </Text>
            </View>
          ) : (
            this.renderPreloader()
          )
        }
        initialNumToRender={24}
        getItemLayout={this.getItemLayout}
        ListFooterComponent={this.renderFooter}
      />
    )
  }

  render() {
    const { hasCameraPermission } = this.state
    if (!hasCameraPermission) return this.props.noCameraPermissionComponent || null

    return <View style={styles.container}>{!this.state.isAlbumList ? this.renderImages() : this.renderAlbum()}</View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titletext: {
    ...TextStyles.mediumText,
    fontWeight: 'bold',
  },
})
