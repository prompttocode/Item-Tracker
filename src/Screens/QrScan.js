import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useContext, useLayoutEffect } from 'react';
import { View, StyleSheet, Text, Alert, AppState } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartContext } from '../context/CartContext';
import CartIcon from '../components/CartIcon';

const QrScan = () => {
  const navigation = useNavigation();
  const device = useCameraDevice('back');
  const { addToCart } = useContext(CartContext);

  const [hasPermission, setHasPermission] = useState(false);
  // Use a state to control scanning to avoid multiple scans in quick succession
  const [isScanningActive, setIsScanningActive] = useState(true);

  // Add CartIcon to header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTintColor: 'white', // For back button and other header elements
      headerTitleStyle: {
        color: 'white', // For the title text
      },
      headerRight: () => <CartIcon />,
    });
  }, [navigation]);

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      const permissionGranted = cameraPermission === 'granted';
      setHasPermission(permissionGranted);
      if (!permissionGranted) {
        Alert.alert('Lỗi', 'Không có quyền truy cập camera.');
        navigation.goBack();
      }
    };
    requestPermissions();
  }, [navigation]);

  // Reset scanning state when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setIsScanningActive(true);
      return () => setIsScanningActive(false);
    }, [])
  );
  
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'upc-e'],
    onCodeScanned: async (codes) => {
      if (isScanningActive && codes.length > 0 && codes[0].value) {
        setIsScanningActive(false); // Stop scanning immediately after a successful scan
        const scannedId = codes[0].value;

        try {
          const productJSON = await AsyncStorage.getItem(scannedId);
          if (productJSON) {
            const product = JSON.parse(productJSON);
            addToCart(product);
            Alert.alert(
              'Thành công',
              `"${product.name}" đã được thêm vào giỏ hàng.`,
              [{ text: 'OK', onPress: () => setIsScanningActive(true) }] // Resume scanning after alert
            );
          } else {
            Alert.alert(
              'Thông báo',
              'Sản phẩm chưa có trong hệ thống. Bạn có muốn thêm mới không?',
              [
                { text: 'Hủy', style: 'cancel', onPress: () => setIsScanningActive(true) },
                { text: 'Thêm mới', onPress: () => navigation.navigate('AddScreen', { id: scannedId }) }
              ]
            );
          }
        } catch (error) {
          console.error("Failed to process scanned code:", error);
          Alert.alert('Lỗi', 'Không thể xử lý mã vừa quét.',
            [{ text: 'OK', onPress: () => setIsScanningActive(true) }]
        );
        }
      }
    },
  });

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không tìm thấy camera sau</Text>
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
        isActive={true} // Camera is always active when screen is focused
        codeScanner={codeScanner}
      />
      <View style={styles.overlay}>
        <View style={styles.scanMarker} />
        <Text style={styles.instructions}>Di chuyển camera vào giữa mã QR</Text>
      </View>
    </View>
  );
}

export default QrScan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
    textAlign: 'center'
  },
  scanMarker: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
});