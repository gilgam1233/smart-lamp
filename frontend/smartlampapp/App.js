import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import * as SecureStore from 'expo-secure-store';

import { MyContext } from "./configs/Contexts";
import RootNavigator from "./RootNavigator";
import Apis from "./configs/Apis";

const App = () => {
  // 1. Quản lý trạng thái User và Loading
  const [user, setUserState] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const setUser = (userData) => {
    setUserState(userData);
  };

  // 3. Khôi phục phiên đăng nhập (Auto-login)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Lấy Token và dữ liệu User từ bộ nhớ tạm của điện thoại
        const token = await SecureStore.getItemAsync('access_token');
        const savedUserStr = await SecureStore.getItemAsync('user');
        
        if (token && savedUserStr) {
          Apis.defaults.headers.Authorization = `Bearer ${token}`;
          
          let savedUser = JSON.parse(savedUserStr);
          setUser(savedUser);
          
          console.log("✅ Auto-login thành công với user:", savedUser.username || "Unknown");
        }
      } catch (error) {
        console.error("❌ Lỗi khôi phục phiên:", error.message);
        await AsyncStorage.multiRemove(['access_token', 'user']);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  // 4. Màn hình Loading khi mới mở App
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FB' }}>
        <ActivityIndicator size="large" color="#5D9CEC" />
        <Text style={{ marginTop: 12, color: '#6B7280', fontWeight: '500' }}>
          Đang kết nối hệ thống Đèn Thông Minh...
        </Text>
      </View>
    );
  }

  // 5. Giao diện chính bọc trong các Provider
  return (
    <MyContext.Provider value={{ 
      user, 
      setUser
    }}>
      <PaperProvider 
        settings={{
          icon: props => <MaterialCommunityIcons {...props} />,
        }}
      >
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </MyContext.Provider>
  );
}

export default App;