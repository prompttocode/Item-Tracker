import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Button,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartContext } from '../context/CartContext';

const BillScreen = () => {
  const navigation = useNavigation();
  const { cart, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);

  const total = cart.reduce(
    (sum, item) => sum + item.standard_price * item.quantity,
    0,
  );

  const handleCancel = () => {
    Alert.alert('Hủy hóa đơn', 'Bạn có chắc muốn xóa toàn bộ giỏ hàng?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Có',
        style: 'destructive',
        onPress: () => {
          clearCart();
          navigation.goBack();
        },
      },
    ]);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng trống!');
      return;
    }

    const invoice = {
      id: `invoice_${new Date().toISOString()}`,
      createdAt: new Date().toISOString(),
      items: cart,
      total: total,
    };

    try {
      await AsyncStorage.setItem(invoice.id, JSON.stringify(invoice));
      Alert.alert('Thành công', 'Hóa đơn đã được lưu.', [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            navigation.replace('InvoiceHistoryScreen');
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to save invoice:', error);
      Alert.alert('Lỗi', 'Không thể lưu hóa đơn.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          {item.standard_price.toLocaleString('vi-VN')} đ
        </Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
          <Text style={styles.quantityButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
          <Text style={styles.quantityButton}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống.</Text>
            <Button title="Bắt đầu quét sản phẩm" onPress={() => navigation.navigate('QrScan')} />
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
          />
          <View style={styles.footer}>
            <Text style={styles.totalText}>
              Tổng cộng: {total.toLocaleString('vi-VN')} đ
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Hủy hóa đơn" onPress={handleCancel} color="#e74c3c" />
              <Button title={`Thanh toán (${cart.length})`} onPress={handleCheckout} color="#27ae60" />
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default BillScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 150, // space for footer
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    color: '#007bff',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});