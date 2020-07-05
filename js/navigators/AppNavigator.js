import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import WelcomePage from '../pages/WelcomePage';
import HomePage from '../pages/HomePage';
import DetailPage from '../pages/DetailPage';
import WebViewPage from '../pages/WebViewPage';
import AboutPage from '../pages/about/AboutPage';
import AboutMePage from '../pages/about/AboutMePage';
import CustomKeyPage from '../pages/CustomKeyPage';
import SortKeyPage from '../pages/SortKeyPage';
import SearchPage from '../pages/SearchPage';

const Stack = createStackNavigator();

export default function AppStackNavigator() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {loading ? (
          <>
            <Stack.Screen name="WelcomePage" component={WelcomePage} />
          </>
        ) : (
          <>
            <Stack.Screen
              options={{
                title: 'HomePage',
                header: null,
              }}
              name="HomePage"
              component={HomePage}
            />
            <Stack.Screen
              name="DetailPage"
              component={DetailPage}
              options={{
                title: 'DetailPage',
                header: null,
              }}
            />
            <Stack.Screen
              name="WebViewPage"
              component={WebViewPage}
              options={{
                title: 'WebViewPage',
                header: null,
              }}
            />
            <Stack.Screen
              name="AboutPage"
              component={AboutPage}
              options={{
                title: 'AboutPage',
                header: null,
              }}
            />
            <Stack.Screen
              name="AboutMePage"
              component={AboutMePage}
              options={{
                title: 'AboutMePage',
                header: null,
              }}
            />
            <Stack.Screen
              name="CustomKeyPage"
              component={CustomKeyPage}
              options={{
                title: 'CustomKeyPage',
                header: null,
              }}
            />
            <Stack.Screen
              name="SortKeyPage"
              component={SortKeyPage}
              options={{
                title: 'SortKeyPage',
                header: null,
              }}
            />
            <Stack.Screen
              name="SearchPage"
              component={SearchPage}
              options={{
                title: 'SearchPage',
                header: null,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
