import { StyleSheet } from "react-native";

export default StyleSheet.create({
  bg: { 
    flex: 1, 
    backgroundColor: '#F5F7FB' 
  },
  avatar: { 
    alignItems: 'center', 
    marginTop: 40, 
    marginBottom: 20 
  },
  avatarBorder: { 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderRadius: 70, 
    padding: 5, 
    borderColor: '#5D9CEC' 
  },
  name: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginTop: 15, 
    color: '#1F2937' 
  },
  editField: { 
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  input: { 
    marginBottom: 15, 
    backgroundColor: 'white' 
  },
  radioContainer: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 15, 
    backgroundColor: 'white' 
  },
  radioLabel: { 
    color: '#6B7280', 
    fontSize: 13, 
    marginBottom: 8 
  },
  radioRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  radioItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 30 
  },
  info: { 
    margin: 20, 
    backgroundColor: 'white', 
    borderRadius: 16, 
    elevation: 2 
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12 
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  infoTitle: { 
    marginLeft: 12, 
    fontSize: 15, 
    color: '#6B7280', 
    fontWeight: 'bold' 
  },
  text: { 
    fontSize: 15, 
    color: '#1F2937', 
    fontWeight: '600' 
  },
  btnEdit: { 
    marginTop: 10, 
    borderColor: '#5D9CEC', 
    borderRadius: 8,
    borderWidth: 1
  },
  btnEditLabel: { 
    color: '#5D9CEC', 
    fontWeight: 'bold',
    fontSize: 15
  },
  btnLogout: { 
    marginHorizontal: 20, 
    marginBottom: 30, 
    borderColor: '#ff4d4d', 
    borderRadius: 8, 
    borderWidth: 1 
  },
  btnLogoutLabel: { 
    color: '#ff4d4d', 
    fontWeight: 'bold',
    fontSize: 15
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginTop: 10
  },
  btnCancel: { 
    flex: 1, 
    marginRight: 10, 
    borderColor: '#ff4d4d' 
  },
  btnSave: { 
    flex: 1, 
    backgroundColor: '#5D9CEC' 
  }
});