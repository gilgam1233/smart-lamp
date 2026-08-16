import React, { useState, useContext, useEffect } from 'react';
import { View, FlatList, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Avatar, Button, Card, Text, Chip, IconButton, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyContext } from '../../../configs/Contexts'; 
import { authApis, endpoints } from '../../../configs/Apis'; 
import styles from './Styles';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useContext(MyContext);
  
  const [devices, setDevices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editDeviceName, setEditDeviceName] = useState('');

  // 1. LẤY DANH SÁCH THIẾT BỊ TỪ BACKEND
  const fetchDevices = async () => {
    try {
      // let token = await AsyncStorage.getItem('access_token');
      let token =  await SecureStore.getItemAsync('access_token');
      let res = await authApis(token).get(endpoints['lamps']);
      setDevices(res.data);
    } catch (ex) {
      console.error("Lỗi tải danh sách thiết bị:", ex);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDevices();
    } else {
      setDevices([]);
    }
  }, [user]);

  // 2. THÊM THIẾT BỊ MỚI
  const handleAddDevice = async () => {
    if (!newDeviceId) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã thiết bị!');
      return;
    }
    try {
      // let token = await AsyncStorage.getItem('access_token');
      let token =  await SecureStore.getItemAsync('access_token');

      await authApis(token).post(`${endpoints['lamps']}add/`, {
        device_id: newDeviceId,
        name: newDeviceName || 'Đèn Mới'
      });

      Alert.alert('Thành công', 'Đã thêm đèn mới!');
      setModalVisible(false);
      setNewDeviceId('');
      setNewDeviceName('');
      fetchDevices(); 
    } catch (ex) {
      let errorMsg = "Không thể thêm thiết bị. Có thể mã thiết bị đã tồn tại!";
      if (ex.response && ex.response.data && ex.response.data.error) {
          errorMsg = ex.response.data.error;
      }
      Alert.alert('Lỗi', errorMsg);
    }
  };

  const openEditModal = (device) => {
    setEditingDevice(device);
    setEditDeviceName(device.name);
    setEditModalVisible(true);
  };

  // 3. ĐỔI TÊN THIẾT BỊ
  const handleEditDevice = async () => {
    if (!editDeviceName.trim()) {
      Alert.alert('Lỗi', 'Tên đèn không được để trống!');
      return;
    }
    try {
      // let token = await AsyncStorage.getItem('access_token');
      let token =  await SecureStore.getItemAsync('access_token');

     await authApis(token).patch(`${endpoints['lamps']}${editingDevice.device_id}/rename/`, {
        name: editDeviceName
      });

      Alert.alert('Thành công', 'Đã đổi tên đèn!');
      setEditModalVisible(false);
      setEditingDevice(null);
      setEditDeviceName('');
      fetchDevices();
    } catch (ex) {
      Alert.alert('Lỗi', 'Không thể đổi tên thiết bị lúc này!');
    }
  };

  // 4. XÓA THIẾT BỊ (HỦY LIÊN KẾT)
  const handleRemoveDevice = (lamp) => {
    Alert.alert(
      "Xóa thiết bị",
      `Bạn có chắc chắn muốn xóa "${lamp.name}" khỏi tài khoản không?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive", // Giúp nút Xóa có màu đỏ trên iOS
          onPress: async () => {
            try {
              // let token = await AsyncStorage.getItem('access_token');
              let token =  await SecureStore.getItemAsync('access_token');

              await authApis(token).delete(`${endpoints['lamps']}${lamp.device_id}/remove/`);
              
              Alert.alert('Thành công', 'Đã xóa thiết bị khỏi tài khoản!');
              fetchDevices(); // Load lại danh sách sau khi xóa

            } catch (ex) {
              Alert.alert('Lỗi', 'Không thể xóa thiết bị lúc này!');
              console.error(ex);
            }
          }
        }
      ]
    );
  };

  // 5. BẬT/TẮT THIẾT BỊ BẰNG MQTT
  const toggleLamp = async (lamp) => {
    const newStatus = !lamp.status;
    const commandToHardware = newStatus ? "ON" : "OFF";

    setDevices(prevDevices => 
      prevDevices.map(d => 
        d.device_id === lamp.device_id ? { ...d, status: newStatus } : d
      )
    );

    try {
      // let token = await AsyncStorage.getItem('access_token');
      let token = await SecureStore.getItemAsync('access_token');

      await authApis(token).post(`${endpoints['lamps']}toggle/`, {
        device_id: lamp.device_id,
        command: commandToHardware
      });
    } catch (ex) {
      setDevices(prevDevices => 
        prevDevices.map(d => 
          d.device_id === lamp.device_id ? { ...d, status: !newStatus } : d
        )
      );
      Alert.alert('Lỗi kết nối', 'Không thể gửi lệnh tới thiết bị!');
    }
  };

  const renderStatusChip = (status) => {
    if (status) {
      return <Chip style={[styles.chip, { backgroundColor: '#E8F5E9' }]} textStyle={{ color: '#2E7D32' }}>Đang bật</Chip>;
    }
    return <Chip style={[styles.chip, { backgroundColor: '#FFEBEE' }]} textStyle={{ color: '#C62828' }}>Đang tắt</Chip>;
  };

  const renderDeviceItem = ({ item }) => (
    <Card style={[
        styles.cardItem, 
        { borderLeftColor: item.status ? '#5D9CEC' : '#9E9E9E' }
      ]} 
      mode="contained"
    >
      <Card.Content style={styles.cardContentRow}>
        <View style={styles.leftContent}>
          <View style={styles.deviceNameRow}>
            <Text variant="titleMedium" style={styles.timeText}>
              {item.name}
            </Text>
            
            {/* Nhóm 2 nút icon kế bên nhau */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton 
                icon="pencil-outline" 
                size={18} 
                iconColor="#6B7280"
                onPress={() => openEditModal(item)}
                style={styles.editIcon}
              />
              <IconButton 
                icon="trash-can-outline" 
                size={18} 
                iconColor="#FF4D4D" // Màu đỏ báo hiệu hành động xóa
                onPress={() => handleRemoveDevice(item)}
                style={styles.editIcon}
              />
            </View>
          </View>
          
          <Text variant="bodyMedium" style={styles.typeText}>
            Mã thiết bị: {item.device_id}
          </Text>
          
          <View style={styles.statusContainer}>
            {renderStatusChip(item.status)}
          </View>
        </View>

        <View style={styles.rightContent}>
          <Avatar.Icon 
            size={50} 
            icon={item.status ? "lightbulb-on" : "lightbulb-outline"} 
            backgroundColor={item.status ? "#FFF3E0" : "#E0E0E0"} 
            color={item.status ? "#E65100" : "#757575"}
          />
          <Switch 
            value={item.status} 
            onValueChange={() => toggleLamp(item)} 
            style={styles.switchControl}
            color="#5D9CEC"
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {!user ? (
        <View style={styles.unauthContainer}>
          <Text style={styles.unauthText}>Bạn cần đăng nhập để xem và thêm đèn</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('login')}>
            <Text style={styles.loginButtonText}>Đăng Nhập Ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Danh sách thiết bị</Text>
            <Button mode="text" icon="plus" compact onPress={() => setModalVisible(true)}>
              Thêm đèn
            </Button>
          </View>

          <FlatList
            data={devices}
            keyExtractor={(item) => item.device_id.toString()} 
            renderItem={renderDeviceItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Bạn chưa có thiết bị nào.</Text>
            }
          />
        </>
      )}

      {/* MODAL 1: THÊM ĐÈN */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm Thiết Bị Mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã thiết bị (VD: ESP32_01)"
              value={newDeviceId}
              onChangeText={setNewDeviceId}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="Đặt tên đèn (VD: Đèn Bếp)"
              value={newDeviceName}
              onChangeText={setNewDeviceName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddDevice}>
                <Text style={styles.saveButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ĐỔI TÊN ĐÈN */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đổi Tên Thiết Bị</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên mới (VD: Đèn Bếp)"
              value={editDeviceName}
              onChangeText={setEditDeviceName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleEditDevice}>
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default HomeScreen;