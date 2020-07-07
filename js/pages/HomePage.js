import React, {Component} from 'react';
import DynamicTabNavigator from '../navigators/DynamicTabNavigator';
import NavigationUtil from '../navigators/NavigationUtil';
import SafeAreaViewPlus from '../common/SafeAreaViewPlus';
import {CommonActions} from '@react-navigation/native';
import {connect} from 'react-redux';
import BackPressComponent from '../common/BackPressComponent';
// import actions from '../action';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.backPress = new BackPressComponent({backPress: this.onBackPress});
  }

  componentDidMount() {
    this.backPress.componentDidMount();
  }

  componentWillUnmount() {
    this.backPress.componentWillUnmount();
  }

  /**
   * 处理 Android 中的物理返回键
   * https://reactnavigation.org/docs/en/redux-integration.html#handling-the-hardware-back-button-in-android
   * @returns {boolean}
   */
  onBackPress = () => {
    const {dispatch, nav} = this.props;
    //if (nav.index === 0) {
    // if (nav.routes[1].index === 0) {
    //   //如果RootNavigator中的MainNavigator的index为0，则不处理返回事件
    //   return false;
    // }
    dispatch(CommonActions.goBack());
    return true;
  };

  render() {
    const {theme} = this.props;
    NavigationUtil.navigation = this.props.navigation;
    return (
      <SafeAreaViewPlus topColor={theme.themeColor}>
        <DynamicTabNavigator />
      </SafeAreaViewPlus>
    );
  }
}

const mapStateToProps = (state) => ({
  theme: state.theme.theme,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
