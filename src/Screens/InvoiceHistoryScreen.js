import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const InvoiceHistoryScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const keys = await AsyncStorage.getAllKeys();
      const invoiceKeys = keys.filter(key => key.startsWith('invoice_'));
      const items = await AsyncStorage.multiGet(invoiceKeys);
      const loadedInvoices = items
        .map(item => JSON.parse(item[1]))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by date descending
      setInvoices(loadedInvoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử hóa đơn.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [loadInvoices]),
  );

  const handleClearHistory = () => {
    Alert.alert(
      'Xóa lịch sử',
      'Bạn có chắc chắn muốn xóa tất cả hóa đơn không? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const invoiceKeys = keys.filter(key => key.startsWith('invoice_'));
              await AsyncStorage.multiRemove(invoiceKeys);
              setInvoices([]); // Clear state
              Alert.alert('Thành công', 'Toàn bộ lịch sử đã được xóa.');
            } catch (error) {
              console.error('Failed to clear history:', error);
              Alert.alert('Lỗi', 'Không thể xóa lịch sử.');
            }
          },
        },
      ],
    );
  };

  const renderReceipt = ({ item }) => (
    <View style={styles.receiptContainer}>
      <Text style={styles.receiptHeader}>HÓA ĐƠN BÁN LẺ</Text>
      <Text style={styles.receiptDate}>
        Ngày: {new Date(item.createdAt).toLocaleString('vi-VN')}
      </Text>
      <View style={styles.divider} />
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCell, styles.tableHeader_Name]}>Tên SP</Text>
        <Text style={[styles.tableCell, styles.tableHeader_Qty]}>SL</Text>
        <Text style={[styles.tableCell, styles.tableHeader_Price]}>Đ.Giá</Text>
        <Text style={[styles.tableCell, styles.tableHeader_Total]}>T.Tiền</Text>
      </View>
      <View style={styles.divider} />
      {item.items.map(prod => (
        <View key={prod.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.table_Name]}>{prod.name}</Text>
            <Text style={[styles.tableCell, styles.table_Qty]}>{prod.quantity}</Text>
            <Text style={[styles.tableCell, styles.table_Price]}>{prod.standard_price.toLocaleString('vi-VN')}</Text>
            <Text style={[styles.tableCell, styles.table_Total]}>{(prod.standard_price * prod.quantity).toLocaleString('vi-VN')}</Text>
        </View>
      ))}
      <View style={styles.divider} />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>TỔNG CỘNG:</Text>
        <Text style={styles.totalAmount}>{item.total.toLocaleString('vi-VN')} đ</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      {invoices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có hóa đơn nào.</Text>
          <Button title="Tạo hóa đơn mới" onPress={() => navigation.navigate('QrScan')} />
        </View>
      ) : (
        <>
          <View style={styles.headerButtons}>
            <Button title="Xóa toàn bộ lịch sử" onPress={handleClearHistory} color="#e74c3c"/>
          </View>
          <FlatList
            data={invoices}
            renderItem={renderReceipt}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
          />
        </>
      )}
    </View>
  );
};

export default InvoiceHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  headerButtons: {
      padding: 10,
      backgroundColor: 'white'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 20
  },
  list: {
    padding: 10,
  },
  receiptContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  receiptHeader: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  receiptDate: {
    textAlign: 'center',
    fontSize: 13,
    color: '#555',
    marginBottom: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderStyle: 'dashed',
    marginVertical: 8,
  },
  tableHeader: {
      flexDirection: 'row',
      fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  tableCell: {
      fontSize: 13,
  },
  tableHeader_Name: { flex: 3, fontWeight: 'bold'},
  tableHeader_Qty: { flex: 1, textAlign: 'center', fontWeight: 'bold'},
  tableHeader_Price: { flex: 2, textAlign: 'right', fontWeight: 'bold'},
  tableHeader_Total: { flex: 2, textAlign: 'right', fontWeight: 'bold'},
  table_Name: { flex: 3},
  table_Qty: { flex: 1, textAlign: 'center'},
  table_Price: { flex: 2, textAlign: 'right'},
  table_Total: { flex: 2, textAlign: 'right', fontWeight: 'bold'},

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    alignItems: 'center'
  },
  totalText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#e74c3c',
  },
});