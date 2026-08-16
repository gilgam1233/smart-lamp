import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  Alert, ActivityIndicator, ScrollView, Platform, Keyboard, KeyboardAvoidingView,Modal
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Apis, { endpoints } from '../../../configs/Apis';
import styles from './Styles';

const Register = () => {
  const navigation = useNavigation();

  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dob: '',
    gender: 'Nam'
  });

  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State quản lý DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateValue, setDateValue] = useState(new Date());

  const handleChange = (name, value) => {
    setUser({ ...user, [name]: value });
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateValue(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('dob', formattedDate);
    }
  };

  const validate = () => {
    if (!user.username || !user.password || !user.email || !user.phone || !user.dob) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ các trường bắt buộc!');
      return false;
    }
    if (user.password !== user.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return false;
    }
    return true;
  };
const handleRegister = async () => {
    if (validate()) {
      try {
        setLoading(true);

        // BƯỚC 1: Đổi từ JSON object sang FormData giống hệt Postman
        let form = new FormData();
        form.append('username', user.username);
        form.append('password', user.password);
        form.append('email', user.email);
        form.append('first_name', user.firstName);
        form.append('last_name', user.lastName);
        form.append('phone', user.phone);
        form.append('dob', user.dob);
        
        // Theo Postman, bạn gửi 1 cho Nam và 0 cho Nữ. 
        // Nếu backend nhận True/False thì truyền chuỗi 'true'/'false'
        form.append('gender', user.gender === 'Nam' ? '1' : '0'); 

        console.log(">>> Đang gửi dữ liệu đăng ký bằng form-data");

        // BƯỚC 2: Thêm header multipart/form-data
        let res = await Apis.post(endpoints['register'], form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res.status === 201 || res.status === 200) {
          setShowSuccessModal(true);
        }
      } catch (ex) {
        let errorMsg = "Không thể kết nối đến máy chủ!";

        if (ex.response && ex.response.data) {
          errorMsg = Object.values(ex.response.data).flat().join('\n');
        }

        Alert.alert('Đăng ký thất bại', errorMsg);
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.authContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: isKeyboardVisible ? 100 : 20 }}
          keyboardShouldPersistTaps="handled"
        >

          <Text style={styles.authTitle}>Tạo tài khoản</Text>
          <Text style={styles.authSubtitle}>Bắt đầu trải nghiệm nhà thông minh</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TextInput
              style={[styles.authInput, { flex: 0.48 }]}
              placeholder="Họ (Last Name)"
              value={user.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
            />
            <TextInput
              style={[styles.authInput, { flex: 0.48 }]}
              placeholder="Tên (First Name)"
              value={user.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
            />
          </View>

          {/* Giới tính */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 }}>
            <Text style={{ fontSize: 16, color: '#1F2937', marginRight: 15 }}>Giới tính:</Text>
            <RadioButton.Group onValueChange={newValue => handleChange('gender', newValue)} value={user.gender}>
              <View style={{ flexDirection: 'row' }}>

                {/* Bọc TouchableOpacity để bấm vào đâu trong khu vực này cũng ăn ngay */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                  onPress={() => handleChange('gender', 'Nam')} // Cập nhật state ngay lập tức
                  activeOpacity={0.7}
                >
                  <RadioButton value="Nam" color="#5D9CEC" />
                  <Text style={{ fontSize: 16 }}>Nam</Text>
                </TouchableOpacity>

                {/* Tương tự cho giới tính Nữ */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => handleChange('gender', 'Nữ')}
                  activeOpacity={0.7}
                >
                  <RadioButton value="Nữ" color="#5D9CEC" />
                  <Text style={{ fontSize: 16 }}>Nữ</Text>
                </TouchableOpacity>

              </View>
            </RadioButton.Group>
          </View>

          {/* Ngày sinh */}
          <TouchableOpacity onPress={() => { setShowDatePicker(true); Keyboard.dismiss(); }}>
            <View pointerEvents="none">
              <TextInput
                style={styles.authInput}
                placeholder="Ngày sinh (YYYY-MM-DD) *"
                value={user.dob}
                editable={false}
              />
            </View>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateValue}
              mode="date"
              display="default"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}

          <TextInput
            style={styles.authInput}
            placeholder="Số điện thoại *"
            keyboardType="phone-pad"
            value={user.phone}
            onChangeText={(text) => handleChange('phone', text)}
          />

          <TextInput
            style={styles.authInput}
            placeholder="Email *"
            keyboardType="email-address"
            value={user.email}
            onChangeText={(text) => handleChange('email', text)}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.authInput}
            placeholder="Tên đăng nhập (Username) *"
            value={user.username}
            onChangeText={(text) => handleChange('username', text)}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.authInput}
            placeholder="Mật khẩu *"
            value={user.password}
            onChangeText={(text) => handleChange('password', text)}
            secureTextEntry={true}
          />

          <TextInput
            style={styles.authInput}
            placeholder="Xác nhận mật khẩu *"
            value={user.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
            secureTextEntry={true}
          />

          <TouchableOpacity style={styles.authButton} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.authButtonText}>Đăng Ký</Text>
            )}
          </TouchableOpacity>

          <View style={styles.authLinkRow}>
            <Text style={styles.authLinkText}>Đã có tài khoản?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.authLinkAction}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

<Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center', paddingVertical: 30 }]}>
            
            {/* Icon check xanh lá cây cho đẹp */}
            <View style={{ backgroundColor: '#E8F5E9', borderRadius: 50, padding: 15, marginBottom: 15 }}>
              <Text style={{ fontSize: 40 }}>✅</Text>
            </View>

            <Text style={styles.modalTitle}>Đăng ký thành công!</Text>
            <Text style={{ textAlign: 'center', color: '#6B7280', marginBottom: 25, fontSize: 15, paddingHorizontal: 10 }}>
              Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để trải nghiệm ngay.
            </Text>

            {/* Đây chính là nút TouchableOpacity mà bạn muốn! */}
            <TouchableOpacity 
              style={[styles.authButton, { width: '100%' }]} 
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.authButtonText}>Đi đến Đăng nhập</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;