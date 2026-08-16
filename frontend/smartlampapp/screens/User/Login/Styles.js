import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  headerTextContainer: { flex: 1 },
  welcomeText: { fontWeight: 'bold', color: '#5D9CEC', fontSize: 18 },
  subWelcomeText: { color: '#6B7280', marginTop: 4 },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
  },
  sectionTitle: { fontWeight: 'bold', color: '#1F2937', fontSize: 15 },
  
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  cardItem: { marginBottom: 15, backgroundColor: '#FFF', borderRadius: 16, borderLeftWidth: 5 },
  cardContentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  leftContent: { flex: 1 },
  
  // Tách inline CSS ra thành style chuẩn
  deviceNameRow: { flexDirection: 'row', alignItems: 'center' },
  editIcon: { margin: 0, marginLeft: 4, width: 24, height: 24 },
  
  timeText: { fontWeight: 'bold', color: '#5D9CEC', fontSize: 16 },
  patientName: { fontWeight: 'bold', color: '#374151', marginTop: 4, fontSize: 15 },
  typeText: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  statusContainer: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  chip: { alignItems: 'center', justifyContent: 'center', padding: 0, borderRadius: 15 },
  rightContent: { flexDirection: 'row', alignItems: 'center' },
  switchControl: { marginLeft: 10 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#666' },

  // ==========================
  // STYLES CHO TRẠNG THÁI CHƯA ĐĂNG NHẬP
  // ==========================
  unauthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50
  },
  unauthText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center'
  },
  loginButton: {
    backgroundColor: '#5D9CEC',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },

  // ==========================
  // STYLES CHO MODAL THÊM/SỬA ĐÈN
  // ==========================
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', width: '85%', padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#1F2937' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { padding: 12, flex: 1, alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, marginRight: 10 },
  cancelButtonText: { color: '#4B5563', fontSize: 16, fontWeight: 'bold' },
  saveButton: { padding: 12, flex: 1, alignItems: 'center', backgroundColor: '#5D9CEC', borderRadius: 8, marginLeft: 10 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  // ==========================
  // STYLES CHO LOGIN & REGISTER
  // ==========================
  authContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 24,
    justifyContent: 'center',
  },
  authLogo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 30,
    textAlign: 'center',
  },
  authInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937'
  },
  authButton: {
    backgroundColor: '#5D9CEC',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#5D9CEC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  authButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  authLinkText: {
    color: '#6B7280',
    fontSize: 15,
  },
  authLinkAction: {
    color: '#5D9CEC',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 5,
  }

  
});