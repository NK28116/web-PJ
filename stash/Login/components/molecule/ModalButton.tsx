import React from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ModalProps,
} from 'react-native';

type ModalButtonProps = {
  visible: boolean;
  onClose: () => void;
  message?: string;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  variant?: 'single' | 'confirm';
  animationType?: ModalProps['animationType'];
  onRequestCloseAlert?: string;
};

const ModalButton: React.FC<ModalButtonProps> = ({
  visible,
  onClose,
  message = 'メッセージ',
  okText = 'OK',
  cancelText = 'キャンセル',
  onOk,
  onCancel,
  variant = 'single',
  animationType = 'none',
  onRequestCloseAlert = 'Modal has been closed.',
}) => {
  const handleOk = () => {
    onOk?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Modal
      animationType={animationType}
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        if (onRequestCloseAlert) Alert.alert(onRequestCloseAlert);
        onClose();
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text>{message}</Text>

          {variant === 'confirm' ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.okButton]}
                onPress={handleOk}
              >
                <Text style={styles.buttonText}>{okText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.okButton, styles.singleButton]}
              onPress={handleOk}
            >
              <Text style={styles.buttonText}>{okText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ModalButton;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalView: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 5,
    margin: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    minWidth: 120,
  },
  singleButton: {
    marginTop: 20,
    minWidth: 200,
  },
  okButton: {
    backgroundColor: '#FF6F61',
  },
  cancelButton: {
    backgroundColor: '#E6E6E6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: '#333',
  },
});
