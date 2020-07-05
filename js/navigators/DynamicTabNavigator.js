import React, {Component} from 'react';
import {
  createBottomTabNavigator,
  BottomTabBar,
} from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import {connect} from 'react-redux';
import PopularPage from '../pages/PopularPage';
import MyPage from '../pages/MyPage';
import TrendingPage from '../pages/TrendingPage';
import FavoritePage from '../pages/FavoritePage';

const Tab = createBottomTabNavigator();

class DynamicTabNavigator extends Component {
  _tabNavigator() {
    return (
      <Tab.Navigator
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
        }}
        tabBar={(props) => <TabBar theme={this.props.theme} {...props} />}>
        <Tab.Screen
          name="Popular"
          component={PopularPage}
          options={{
            tabBarLabel: '最热',
            tabBarIcon: ({color}) => (
              <MaterialIcons name={'whatshot'} size={26} style={{color}} />
            ),
          }}
        />
        <Tab.Screen
          name="Trending"
          component={TrendingPage}
          options={{
            tabBarLabel: '趋势',
            tabBarIcon: ({color}) => (
              <Ionicons name={'md-trending-up'} size={26} style={{color}} />
            ),
          }}
        />
        <Tab.Screen
          name="Favorite"
          component={FavoritePage}
          options={{
            tabBarLabel: '收藏',
            tabBarIcon: ({color}) => (
              <MaterialIcons name={'favorite'} size={26} style={{color}} />
            ),
          }}
        />
        <Tab.Screen
          name="My"
          component={MyPage}
          options={{
            tabBarLabel: '我的',
            tabBarIcon: ({color}) => (
              <Entypo name={'user'} size={26} style={{color}} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  render() {
    return this._tabNavigator();
  }
}

class TabBar extends React.Component {
  render() {
    return (
      <BottomTabBar
        {...this.props}
        activeTintColor={this.props.theme.themeColor}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  theme: state.theme.theme,
});

export default connect(mapStateToProps)(DynamicTabNavigator);
