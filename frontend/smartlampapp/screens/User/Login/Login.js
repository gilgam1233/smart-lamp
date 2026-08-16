import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar } from 'react-native-paper';
import { MyContext } from '../../../configs/Contexts'; 
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';

// ĐÃ SỬA 1: Import thêm authApis từ file Apis.js
import Apis, { authApis, endpoints } from '../../../configs/Apis'; 
import styles from './Styles'; 

const Login = () => {
  const navigation = useNavigation();
  const { setUser } = useContext(MyContext);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tài khoản và mật khẩu!');
      return;
    }

    try {
      setLoading(true);
      let form = new FormData();
      form.append('username', username); 
      form.append('password', password); 
      form.append('client_id', process.env.EXPO_PUBLIC_CLIENT_ID); 
      form.append('client_secret', process.env.EXPO_PUBLIC_CLIENT_SECRET);
      form.append('grant_type', 'password');

      let res = await Apis.post(endpoints['login'], form, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });
      
      const token = res.data.access_token;
      
      // ĐÃ SỬA 2: Dùng authApis(token) thay vì Apis.get để đảm bảo Token được đính kèm đúng chuẩn
      const userRes = await authApis(token).get(endpoints['current-user']);
      
      const userData = userRes.data;
      
      // await AsyncStorage.setItem('access_token', token);
      // await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      await SecureStore.setItemAsync('access_token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));

      setUser(userData);
      
      navigation.navigate('home'); 
      
    } catch (error) {
      console.error(error);
      Alert.alert('Đăng nhập thất bại', 'Sai tài khoản hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <View style={styles.authLogo}>
        <Avatar.Icon size={80} icon="home-lightning-bolt-outline" backgroundColor="#E8F0FE" color="#5D9CEC" />
      </View>
      
      <Text style={styles.authTitle}>Chào mừng trở lại</Text>
      <Text style={styles.authSubtitle}>Đăng nhập để điều khiển ngôi nhà của bạn</Text>

      <TextInput
        style={styles.authInput}
        placeholder="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.authInput}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.authButton} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.authButtonText}>Đăng Nhập</Text>
        )}
      </TouchableOpacity>

      <View style={styles.authLinkRow}>
        <Text style={styles.authLinkText}>Chưa có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('register')}>
          <Text style={styles.authLinkAction}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;