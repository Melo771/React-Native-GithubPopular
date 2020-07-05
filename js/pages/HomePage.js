import React, {Component} from 'react';
import DynamicTabNavigator from '../navigators/DynamicTabNavigator';
import NavigationUtil from '../navigators/NavigationUtil';

class HomePage extends Component {
  render() {
    NavigationUtil.navigation = this.props.navigation;
    return <DynamicTabNavigator />;
  }
}

export default HomePage;
