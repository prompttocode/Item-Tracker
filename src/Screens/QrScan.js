import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';

const QrScan = () => {

  const device = useCameraDevice('back');
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      const permissionGranted = cameraPermission === 'granted';
      setHasPermission(permissionGranted);
      if (!permissionGranted) {
        Alert.alert('Lỗi', 'Không có quyền truy cập camera.');
      }
    };
    requestPermissions();
  }, []);
  const navigation = useNavigation()
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'upc-e'],
    onCodeScanned: codes => {
      if (isScanning && codes.length > 0 && codes[0].value) {
        
        navigation.navigate('AddScreen', { id: codes[0].value } );
        setIsScanning(true);
      }
    },
  });

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không tìm thấy camera</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Đang chờ cấp quyền camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={ isScanning}
        codeScanner={codeScanner}
      />
      <View style={styles.overlay}>
        <View style={styles.scanMarker} />
        <Text style={styles.instructions}>Di chuyển camera vào giữa mã QR</Text>
      </View>
    </View>
  );
}

export default QrScan

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
  },
  scanMarker: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
});