import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, View, DeviceInfo} from 'react-native';
import {WebView} from 'react-native-webview';
import NavigationBar from '../common/NavigationBar';
import ViewUtil from '../util/ViewUtil';
const TRENDING_URL = 'https://github.com/';
type Props = {};
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import NavigationUtil from '../navigators/NavigationUtil';
import BackPressComponent from '../common/BackPressComponent';
import FavoriteDao from '../expand/dao/FavoriteDao';
import {FLAG_STORAGE} from '../expand/dao/DataStore';
import EventTypes from '../util/EventTypes';
import EventBus from 'react-native-event-bus';
import {connect} from 'react-redux';

class DetailPage extends Component<Props> {
  constructor(props) {
    super(props);
    this.params = this.props.route.params;
    const {projectModel, flag} = this.params;
    this.favoriteDao = new FavoriteDao(flag);
    this.url =
      projectModel.item.html_url || TRENDING_URL + projectModel.item.repo;
    const title = projectModel.item.full_name || projectModel.item.repo || '';
    this.state = {
      title: title,
      url: this.url,
      canGoBack: false,
      isFavorite: projectModel.isFavorite,
    };
    this.backPress = new BackPressComponent({
      backPress: () => this.onBackPress(),
    });
  }

  componentDidMount() {
    this.backPress.componentDidMount();
  }

  componentWillUnmount() {
    this.backPress.componentWillUnmount();
  }

  onBackPress() {
    this.onBack();
    return true;
  }

  onBack() {
    if (this.state.canGoBack) {
      this.webView.goBack();
    } else {
      NavigationUtil.goBack(this.props.navigation);
    }
  }

  onFavoriteButtonClick() {
    const {projectModel, callback} = this.params;
    const isFavorite = (projectModel.isFavorite = !projectModel.isFavorite);
    callback(isFavorite); //更新Item的收藏状态

    if (this.props.route.params.isFavoritePage) {
      if (this.params.flag === FLAG_STORAGE.flag_popular) {
        EventBus.getInstance().fireEvent(EventTypes.favorite_changed_popular);
      } else {
        EventBus.getInstance().fireEvent(EventTypes.favoriteChanged_trending);
      }
    }

    this.setState({
      isFavorite: isFavorite,
    });
    let key = projectModel.item.repo
      ? projectModel.item.repo
      : projectModel.item.id.toString();
    if (projectModel.isFavorite) {
      this.favoriteDao.saveFavoriteItem(key, JSON.stringify(projectModel.item));
    } else {
      this.favoriteDao.removeFavoriteItem(key);
    }
  }

  renderRightButton() {
    return (
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity onPress={() => this.onFavoriteButtonClick()}>
          <FontAwesome
            name={this.state.isFavorite ? 'star' : 'star-o'}
            size={20}
            style={{color: 'white', marginRight: 10}}
          />
        </TouchableOpacity>
        {ViewUtil.getShareButton(() => {})}
      </View>
    );
  }

  onNavigationStateChange(navState) {
    this.setState({
      canGoBack: navState.canGoBack,
      url: navState.url,
    });
  }

  render() {
    const {theme} = this.props;
    const titleLayoutStyle =
      this.state.title.length > 20 ? {paddingRight: 30} : null;
    let navigationBar = (
      <NavigationBar
        leftButton={ViewUtil.getLeftBackButton(() => this.onBack())}
        titleLayoutStyle={titleLayoutStyle}
        title={this.state.title}
        style={theme.styles.navBar}
        rightButton={this.renderRightButton()}
      />
    );

    return (
      <View style={styles.container}>
        {navigationBar}
        <WebView
          ref={(webView) => (this.webView = webView)}
          startInLoadingState={true}
          onNavigationStateChange={(e) => this.onNavigationStateChange(e)}
          source={{uri: this.state.url}}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: DeviceInfo.isIPhoneX_deprecated ? 30 : 0,
  },
});

const mapStateToProps = (state) => ({
  theme: state.theme.theme,
});

export default connect(mapStateToProps, null)(DetailPage);
