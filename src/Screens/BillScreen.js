import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
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
    <SafeAreaView style={styles.container}>


      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.replace('TabMain')}>
            <Text style={styles.primaryButtonText}>Bắt đầu quét sản phẩm</Text>
          </TouchableOpacity>
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
            <View style={styles.footerRow}>
              <View>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalText}>{total.toLocaleString('vi-VN')} đ</Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel}>
                  <Text style={styles.secondaryButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                  <Text style={styles.checkoutButtonText}>Thanh toán ({cart.length})</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default BillScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#eef2f7',
  },
  headerLeft: { width: 60, alignItems: 'flex-start' },
  headerRight: { width: 60, alignItems: 'flex-end' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerAction: { color: '#2563eb', fontSize: 15 },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#6b7280' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  list: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 180, // space for footer
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 14,
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  itemPrice: { fontSize: 14, color: '#475569', marginTop: 6 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: '#2563eb',
    backgroundColor: '#eef2ff',
    borderRadius: 8,
  },
  quantityText: { fontSize: 16, fontWeight: '700', minWidth: 36, textAlign: 'center' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingTop: 14,
    paddingBottom: 28,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderTopWidth: 1,
    borderColor: '#eef2f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.12,
    shadowRadius: 8,
    elevation: 10,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 12, color: '#6b7280' },
  totalText: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  buttonContainer: { flexDirection: 'row', alignItems: 'center' },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6e9ef',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  secondaryButtonText: { color: '#ef4444', fontWeight: '700' },
  checkoutButton: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  checkoutButtonText: { color: '#fff', fontWeight: '800' },
});