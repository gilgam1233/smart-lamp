import React, { useContext, useState, useEffect } from "react";
import { ScrollView, TouchableOpacity, View, KeyboardAvoidingView, Keyboard, Platform, Alert } from "react-native";
import { Avatar, Button, Card, Divider, HelperText, Icon, RadioButton, Text, TextInput } from "react-native-paper";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyContext } from "../../../configs/Contexts";
import { authApis, endpoints } from "../../../configs/Apis";
import Styles from "./Styles";
import * as SecureStore from 'expo-secure-store';

const Profile = () => {
    const { user, setUser } = useContext(MyContext);
    const nav = useNavigation();
    
    const [isEditing, setIsEditing] = useState(false);
    const [err, setErr] = useState();
    const [loading, setLoading] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // ĐÃ SỬA: Loại bỏ ".profile" vì cấu trúc Database mới là phẳng (flat)
    const [editData, setEditData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        gender: user?.gender === false ? 'Nữ' : 'Nam', // Django boolean: True=Nam, False=Nữ
        dob: user?.dob || ''
    });

    const loadProfile = async () => {
        try {
            // let token = await AsyncStorage.getItem('access_token');
            let token =  await SecureStore.getItemAsync('access_token');

            let res = await authApis(token).get(endpoints['current-user']);

            setUser(res.data);
            setEditData({
                first_name: res.data.first_name || '',
                last_name: res.data.last_name || '',
                email: res.data.email || '',
                phone: res.data.phone || '',
                gender: res.data.gender === false ? 'Nữ' : 'Nam',
                dob: res.data.dob || ''
            });
        } catch (ex) {
            console.error("Lỗi load profile:", ex);
        }
    };

    useEffect(() => {
        let timer = setTimeout(() => {
            loadProfile();
        }, 100);

        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        return () => {
            clearTimeout(timer);
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        }
    }, []);

    const logout = async () => {
        await AsyncStorage.removeItem('access_token');
        setUser(null);
        nav.navigate('home');
    }

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setEditData({ ...editData, dob: formattedDate });
        }
    };

    const handleEdit = () => {
        setShowDatePicker(false);
        setTimeout(() => setIsEditing(true), 150);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setErr("");
            
            // ĐÃ SỬA: Đóng gói dữ liệu thẳng hàng, không bọc trong object profile
            const updatePayload = {
                first_name: editData.first_name,
                last_name: editData.last_name,
                email: editData.email,
                phone: editData.phone,
                gender: editData.gender === 'Nam',
                dob: editData.dob
            };

            // let token = await AsyncStorage.getItem('access_token');
            let token =  await SecureStore.getItemAsync('access_token');

            let res = await authApis(token).patch(endpoints['current-user'], updatePayload);

            if (res.status === 200 || res.status === 204) {
                Alert.alert("Thông báo", "Cập nhật thông tin thành công!");
                setUser(res.data);
                setIsEditing(false);
            }
        } catch (ex) {
            let errorMsg = "Không thể kết nối đến máy chủ!";
            if (ex.response && ex.response.data) {
                errorMsg = Object.values(ex.response.data).flat().join('\n');
                setErr(errorMsg);
            } else {
                setErr(errorMsg);
            }
            Alert.alert("Thông báo", "Cập nhật thất bại, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditData({
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            gender: user?.gender === false ? 'Nữ' : 'Nam',
            dob: user?.dob || ''
        });
        setIsEditing(false);
    };

    if (!user) return null;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
            
            <ScrollView style={Styles.bg} contentContainerStyle={{ paddingBottom: isKeyboardVisible ? 120 : 20 }} showsVerticalScrollIndicator={false}>
                
                {/* 1. HEADER AVATAR VÀ TÊN */}
                <View style={Styles.avatar}>
                    <View style={Styles.avatarBorder}>
                        <Avatar.Icon size={90} icon="account" backgroundColor="#E8F0FE" color="#5D9CEC" />
                    </View>
                    {!isEditing && (
                        <Text style={Styles.name}>
                            {user.last_name} {user.first_name}
                        </Text>
                    )}
                </View>

                {/* 2. THÔNG TIN HOẶC FORM CHỈNH SỬA */}
                {isEditing ? (
                    <View style={Styles.editField}>
                        <TextInput mode="outlined" label="Họ và tên lót" value={editData.last_name} onChangeText={t => setEditData({ ...editData, last_name: t })} style={Styles.input} activeOutlineColor="#5D9CEC" />
                        <TextInput mode="outlined" label="Tên" value={editData.first_name} onChangeText={t => setEditData({ ...editData, first_name: t })} style={Styles.input} activeOutlineColor="#5D9CEC" />
                        <TextInput mode="outlined" label="Email" value={editData.email} onChangeText={t => setEditData({ ...editData, email: t })} style={Styles.input} activeOutlineColor="#5D9CEC" keyboardType="email-address" />
                        <TextInput mode="outlined" label="Số điện thoại" value={editData.phone} onChangeText={t => setEditData({ ...editData, phone: t })} style={Styles.input} activeOutlineColor="#5D9CEC" keyboardType="phone-pad" />

                        <View style={Styles.radioContainer}>
                            <Text style={Styles.radioLabel}>Giới tính</Text>
                            <RadioButton.Group onValueChange={newValue => setEditData({ ...editData, gender: newValue })} value={editData.gender}>
                                <View style={Styles.radioRow}>
                                    <TouchableOpacity style={Styles.radioItem} onPress={() => setEditData({ ...editData, gender: 'Nam' })}>
                                        <RadioButton value="Nam" color="#5D9CEC" />
                                        <Text>Nam</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={Styles.radioItem} onPress={() => setEditData({ ...editData, gender: 'Nữ' })}>
                                        <RadioButton value="Nữ" color="#5D9CEC" />
                                        <Text>Nữ</Text>
                                    </TouchableOpacity>
                                </View>
                            </RadioButton.Group>
                        </View>

                        <TouchableOpacity onPress={() => { setShowDatePicker(true); Keyboard.dismiss(); }}>
                            <View pointerEvents="none">
                                <TextInput mode="outlined" label="Ngày sinh" value={editData.dob} editable={false} style={Styles.input} activeOutlineColor="#5D9CEC" right={<TextInput.Icon icon="calendar" />} />
                            </View>
                        </TouchableOpacity>
                        
                        {showDatePicker && (
                            <DateTimePicker value={editData.dob ? new Date(editData.dob) : new Date()} mode="date" display="default" maximumDate={new Date()} onChange={onChangeDate} />
                        )}

                        {err ? <HelperText type="error" visible={!!err}>{err}</HelperText> : null}
                        
                        <View style={Styles.buttonRow}>
                            <Button mode="outlined" onPress={cancelEdit} disabled={loading} style={Styles.btnCancel} textColor="#ff4d4d">
                                Hủy
                            </Button>
                            <Button mode="contained" onPress={handleSave} loading={loading} disabled={loading} style={Styles.btnSave}>
                                Lưu thay đổi
                            </Button>
                        </View>
                    </View>
                ) : (
                    <Card style={Styles.info}>
                        <Card.Content>
                            <View style={Styles.infoRow}>
                                <View style={Styles.row}>
                                    <Icon source="email-outline" size={22} color="#5D9CEC" />
                                    <Text style={Styles.infoTitle}>Email</Text>
                                </View>
                                <Text style={Styles.text}>{user.email || "Chưa cập nhật"}</Text>
                            </View>
                            <Divider />
                            
                            <View style={Styles.infoRow}>
                                <View style={Styles.row}>
                                    <Icon source="phone-outline" size={22} color="#5D9CEC" />
                                    <Text style={Styles.infoTitle}>Số điện thoại</Text>
                                </View>
                                <Text style={Styles.text}>{user.phone || "Chưa cập nhật"}</Text>
                            </View>
                            <Divider />

                          <View style={Styles.infoRow}>
                                <View style={Styles.row}>
                                    <Icon source="gender-male-female" size={22} color="#5D9CEC" />
                                    <Text style={Styles.infoTitle}>Giới tính</Text>
                                </View>
                                {/* ĐÃ SỬA: Thay True thành true */}
                                <Text style={Styles.text}>{user.gender === false ? 'Nữ' : (user.gender === true ? 'Nam' : 'Chưa cập nhật')}</Text>
                            </View>
                            <Divider />

                            <View style={Styles.infoRow}>
                                <View style={Styles.row}>
                                    <Icon source="calendar-month-outline" size={22} color="#5D9CEC" />
                                    <Text style={Styles.infoTitle}>Ngày sinh</Text>
                                </View>
                                <Text style={Styles.text}>{user.dob || "Chưa cập nhật"}</Text>
                            </View>
                        </Card.Content>
                        
                        <Card.Actions style={{ justifyContent: 'center', paddingBottom: 15 }}>
                            <Button icon="pencil" mode="outlined" onPress={handleEdit} labelStyle={Styles.btnEditLabel} style={Styles.btnEdit}>
                                Chỉnh sửa thông tin
                            </Button>
                        </Card.Actions>
                    </Card>
                )}

                {/* 3. NÚT ĐĂNG XUẤT */}
                {!isEditing && (
                    <Button onPress={logout} mode="outlined" style={Styles.btnLogout} labelStyle={Styles.btnLogoutLabel} icon="logout">
                        Đăng xuất
                    </Button>
                )}
                
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default Profile;