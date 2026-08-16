import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from 'react-native-paper';

import Home from "./screens/User/Home/Home";
import Login from "./screens/User/Login/Login";
import Register from "./screens/User/Register/Register";
import Profile from "./screens/User/Profile/Profile"

import { MyContext } from './configs/Contexts'; 

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const UserTabs = () => {
  const { user } = useContext(MyContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#60c6e8',
        headerTintColor: '#60c6e8',
        headerTitleStyle: {
          fontWeight: 'bold'
        },
        headerTitleAlign: 'center'
      }}
    >
      <Tab.Screen
        name="home" component={HomeStack}
        options={{ 
          title: 'Trang chủ', 
          tabBarIcon: ({ color }) => <Icon source="home-outline" size={22} color={color} /> 
        }}
      />
      
      {!user ? (
        <Tab.Screen
          name="login" component={Login}
          options={{ 
            title: 'Đăng nhập', 
            tabBarIcon: ({ color }) => <Icon source="login" size={22} color={color} />, 
            headerShown: true 
          }}
        />
      ) : (
        <Tab.Screen
          name="profile" component={Profile}
          options={{ 
            title: 'Hồ Sơ', 
            tabBarIcon: ({ color }) => <Icon source="account-circle-outline" size={22} color={color} />, 
            headerShown: true 
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home_screen" component={Home} options={{
        title: 'Trang chủ',
        headerShown: true,
        tabBarActiveTintColor: '#60c6e8',
        tabBarInactiveTintColor: '#6B7280',
        headerTintColor: '#60c6e8',
        headerTitleStyle: {
          fontWeight: 'bold'
        },
        headerTitleAlign: 'center'
      }} />
    </Stack.Navigator>
  );
}

const UserNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={UserTabs} />
      <Stack.Screen name="register" component={Register}
        options={{
          title: 'Đăng ký',
          headerShown: true,
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerStyle: {
            backgroundColor: '#60c6e8'
          }
        }} />
    </Stack.Navigator>
  );
};

export default UserNavigator;