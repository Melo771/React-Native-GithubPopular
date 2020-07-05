import React, {Component} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  RefreshControl,
  DeviceInfo,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import Toast from 'react-native-easy-toast';
import {connect} from 'react-redux';
import actions from '../action';
import TrendingItem from '../common/TrendingItem';
import NavigationBar from '../common/NavigationBar';
import TrendingDialog, {TimeSpans} from '../common/TrendingDialog';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NavigationUtil from '../navigators/NavigationUtil';
import FavoriteUtil from '../util/FavoriteUtil';
import {FLAG_STORAGE} from '../expand/dao/DataStore';
import FavoriteDao from '../expand/dao/FavoriteDao';
import EventTypes from '../util/EventTypes';
import EventBus from 'react-native-event-bus';
import {FLAG_LANGUAGE} from '../expand/dao/LanguageDao';
import ArrayUtil from '../util/ArrayUtil';
import PopularItem from '../common/PopularItem';
const favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_trending);

const Tab = createMaterialTopTabNavigator();
const URL = 'https://trendings.herokuapp.com/repo?';
const EVENT_TYPE_TIME_SPAN_CHANGE = 'EVENT_TYPE_TIME_SPAN_CHANGE';
const pageSize = 10; //设为常量，防止修改

class TrendingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeSpan: TimeSpans[0],
    };
    const {onLoadLanguage} = this.props;
    onLoadLanguage(FLAG_LANGUAGE.flag_language);
    this.preKeys = [];
  }

  renderTrendingDialog() {
    return (
      <TrendingDialog
        ref={(dialog) => (this.dialog = dialog)}
        onSelect={(tab) => this.onSelectTimeSpan(tab)}
      />
    );
  }

  onSelectTimeSpan(tab) {
    this.dialog.dismiss();
    this.setState({
      timeSpan: tab,
    });
    DeviceEventEmitter.emit(EVENT_TYPE_TIME_SPAN_CHANGE, tab);
  }

  renderTitleView() {
    return (
      <View>
        <TouchableOpacity
          underlayColor="transparent"
          onPress={() => this.dialog.show()}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: 18,
                color: '#FFFFFF',
                fontWeight: '400',
              }}>
              趋势 {this.state.timeSpan.showText}
            </Text>
            <MaterialIcons
              name={'arrow-drop-down'}
              size={22}
              style={{color: 'white'}}
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  _tabNav() {
    const {keys, theme} = this.props;
    // 优化效率：根据需要选择是否重新创建建TabNavigator，通常tab改变后才重新创建
    if (
      theme !== this.theme ||
      !this.tabNav ||
      !ArrayUtil.isEqual(this.preKeys, this.props.keys)
    ) {
      this.theme = theme;
      this.preKeys = keys;
      this.tabNav = (
        <Tab.Navigator
          tabBarOptions={{
            tabStyle: styles.tabStyle,
            upperCaseLabel: false, //是否使标签大写，默认为true
            scrollEnabled: true,
            style: {
              backgroundColor: theme.themeColor, //TabBar 的背景颜色
            },
            indicatorStyle: styles.indicatorStyle, //标签指示器的样式
            labelStyle: styles.labelStyle, //文字的样式
          }}
          lazy={true}>
          {keys.map((item, index) => {
            return (
              item.checked && (
                <Tab.Screen
                  key={index}
                  name={`tab${index}`}
                  options={{title: item.name}}>
                  {() => (
                    <TrendingTabPage
                      tabLabel={item.name}
                      timeSpan={this.state.timeSpan}
                      {...this.props}
                      theme={theme}
                    />
                  )}
                </Tab.Screen>
              )
            );
          })}
        </Tab.Navigator>
      );
    }
    return this.tabNav;
  }

  render() {
    const {keys, theme} = this.props;
    let statusBar = {
      backgroundColor: theme.themeColor,
      barStyle: 'default',
    };
    let navigationBar = (
      <NavigationBar
        titleView={this.renderTitleView()}
        statusBar={statusBar}
        style={{backgroundColor: theme.themeColor}}
      />
    );
    const TabNavigator = keys.length ? this._tabNav() : null;

    return (
      <View
        style={[
          styles.container,
          {marginTop: DeviceInfo.isIPhoneX_deprecated ? 30 : 0},
        ]}>
        {navigationBar}
        {TabNavigator}
        {this.renderTrendingDialog()}
      </View>
    );
  }
}

class TrendingTab extends Component {
  constructor(props) {
    super(props);
    const {tabLabel, timeSpan} = this.props;
    this.storeName = tabLabel;
    this.timeSpan = timeSpan;
    this.isFavoriteChanged = false;
  }

  componentDidMount() {
    this.loadData();

    EventBus.getInstance().addListener(
      EventTypes.favoriteChanged_trending,
      (this.favoriteChangeListener = () => {
        this.isFavoriteChanged = true;
      }),
    );

    this.unsubscribe = this.props.navigation.addListener('tabPress', () => {
      if (this.isFavoriteChanged) {
        this.loadData(null, true);
      }
    });

    this.timeSpanChangeListener = DeviceEventEmitter.addListener(
      EVENT_TYPE_TIME_SPAN_CHANGE,
      (timeSpan) => {
        this.timeSpan = timeSpan;
        this.loadData();
      },
    );
  }

  componentWillUnmount() {
    if (this.timeSpanChangeListener) {
      this.timeSpanChangeListener.remove();
    }
    EventBus.getInstance().removeListener(this.favoriteChangeListener);
    this.props.navigation
      .dangerouslyGetParent()
      .removeListener(this.unsubscribe);
  }

  loadData(loadMore, refreshFavorite) {
    const {
      onRefreshTrending,
      onLoadMoreTrending,
      onFlushTrendingFavorite,
    } = this.props;
    const store = this._store();
    const url = this.genFetchUrl(this.storeName);

    if (loadMore) {
      onLoadMoreTrending(
        this.storeName,
        ++store.pageIndex,
        pageSize,
        store.items,
        favoriteDao,
        () => {
          this.refs.toast.show('没有更多了');
        },
      );
    } else if (refreshFavorite) {
      onFlushTrendingFavorite(
        this.storeName,
        store.pageIndex,
        pageSize,
        store.items,
        favoriteDao,
      );
      this.isFavoriteChanged = false;
    } else {
      onRefreshTrending(this.storeName, url, pageSize, favoriteDao);
    }
  }

  /**
   * 获取与当前页面有关的数据
   * @returns {*}
   * @private
   */
  _store() {
    const {trending} = this.props;
    let store = trending[this.storeName];
    if (!store) {
      store = {
        items: [],
        isLoading: false,
        projectModels: [], //要显示的数据
        hideLoadingMore: true, //默认隐藏加载更多
      };
    }
    return store;
  }

  genFetchUrl(key) {
    console.log(key);
    if (key === 'All') {
      key = '';
    }
    return URL + 'lang=' + key + '&' + this.timeSpan.searchText;
  }

  renderItem(data) {
    const {theme} = this.props;
    const item = data.item;
    return (
      <TrendingItem
        projectModel={item}
        theme={theme}
        onSelect={(callback) => {
          NavigationUtil.goPage(
            {
              projectModel: item,
              flag: FLAG_STORAGE.flag_trending,
              callback,
            },
            'DetailPage',
          );
        }}
        onFavorite={(item, isFavorite) =>
          FavoriteUtil.onFavorite(
            favoriteDao,
            item,
            isFavorite,
            FLAG_STORAGE.flag_trending,
          )
        }
      />
    );
  }

  genIndicator() {
    return this._store().hideLoadingMore ? null : (
      <View style={styles.indicatorContainer}>
        <ActivityIndicator style={styles.indicator} />
        <Text>正在加载更多</Text>
      </View>
    );
  }

  render() {
    const {theme} = this.props;
    let store = this._store();
    return (
      <View style={styles.container}>
        <FlatList
          data={store.projectModels}
          renderItem={(data) => this.renderItem(data)}
          keyExtractor={(item, index) => '' + index}
          refreshControl={
            <RefreshControl
              title={'Loading'}
              titleColor={theme.themeColor}
              colors={[theme.themeColor]}
              refreshing={store.isLoading}
              onRefresh={() => this.loadData()}
              tintColor={theme.themeColor}
            />
          }
          ListFooterComponent={() => this.genIndicator()}
          onEndReached={() => {
            setTimeout(() => {
              if (this.canLoadMore) {
                //fix 滚动时两次调用onEndReached https://github.com/facebook/react-native/issues/14015
                this.loadData(true);
                this.canLoadMore = false;
              }
            }, 100);
          }}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => {
            this.canLoadMore = true; //fix 初始化时页调用onEndReached的问题
            console.log('---onMomentumScrollBegin-----');
          }}
        />
        <Toast ref={'toast'} position={'center'} />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  tabStyle: {
    minWidth: 50, //fix minWidth会导致tabStyle初次加载时闪烁
  },
  indicatorStyle: {
    height: 2,
    backgroundColor: 'white',
  },
  labelStyle: {
    fontSize: 13,
    margin: 0,
    color: 'white',
  },
  indicatorContainer: {
    alignItems: 'center',
  },
  indicator: {
    color: 'red',
    margin: 10,
  },
});

const mapDispatchToState = (state) => ({
  trending: state.trending,
});
const mapDispatchToProps = (dispatch) => ({
  onRefreshTrending: (storeName, url, pageSize, favoriteDao) =>
    dispatch(actions.onRefreshTrending(storeName, url, pageSize, favoriteDao)),
  onLoadMoreTrending: (
    storeName,
    pageIndex,
    pageSize,
    items,
    favoriteDao,
    callBack,
  ) =>
    dispatch(
      actions.onLoadMoreTrending(
        storeName,
        pageIndex,
        pageSize,
        items,
        favoriteDao,
        callBack,
      ),
    ),
  onFlushTrendingFavorite: (
    storeName,
    pageIndex,
    pageSize,
    items,
    favoriteDao,
  ) =>
    dispatch(
      actions.onFlushTrendingFavorite(
        storeName,
        pageIndex,
        pageSize,
        items,
        favoriteDao,
      ),
    ),
});

const TrendingTabPage = connect(
  mapDispatchToState,
  mapDispatchToProps,
)(TrendingTab);

const mapTrendingStateToProps = (state) => ({
  keys: state.language.languages,
  theme: state.theme.theme,
});
const mapTrendingDispatchToProps = (dispatch) => ({
  onLoadLanguage: (flag) => dispatch(actions.onLoadLanguage(flag)),
});

export default connect(
  mapTrendingStateToProps,
  mapTrendingDispatchToProps,
)(TrendingPage);
