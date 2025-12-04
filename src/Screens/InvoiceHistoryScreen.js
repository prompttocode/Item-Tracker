import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';

const InvoiceHistoryScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState('date_desc');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

  // Helper to format date to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const keys = await AsyncStorage.getAllKeys();
      const invoiceKeys = keys.filter(key => key.startsWith('invoice_'));
      const items = await AsyncStorage.multiGet(invoiceKeys);
      const loadedInvoices = items.map(item => JSON.parse(item[1]));
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

  const handleClearHistory = useCallback(() => {
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
              if (invoiceKeys.length) {
                await AsyncStorage.multiRemove(invoiceKeys);
              }
              setInvoices([]);
              Alert.alert('Thành công', 'Toàn bộ lịch sử đã được xóa.');
            } catch (error) {
              console.error('Failed to clear history:', error);
              Alert.alert('Lỗi', 'Không thể xóa lịch sử.');
            }
          },
        },
      ],
    );
  }, [setInvoices]);
  
  const filteredAndSortedInvoices = useMemo(() => {
    let processedInvoices = [...invoices];

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      processedInvoices = processedInvoices.filter(inv => new Date(inv.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      processedInvoices = processedInvoices.filter(inv => new Date(inv.createdAt) <= end);
    }

    // Sort
    switch (sortOption) {
      case 'date_asc':
        processedInvoices.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'total_asc':
        processedInvoices.sort((a, b) => a.total - b.total);
        break;
      case 'total_desc':
        processedInvoices.sort((a, b) => b.total - a.total);
        break;
      case 'date_desc':
      default:
        processedInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return processedInvoices;
  }, [invoices, sortOption, startDate, endDate]);
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
      {invoices.length === 0 && !startDate && !endDate ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có hóa đơn nào.</Text>
          <Button title="Tạo hóa đơn mới" onPress={() => navigation.navigate('QrScan')} />
        </View>
      ) : (
        <>
          <View style={styles.controlsContainer}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={sortOption}
                onValueChange={(itemValue) => setSortOption(itemValue)}
              >
                <Picker.Item label="Sắp xếp: Mới nhất" value="date_desc" />
                <Picker.Item label="Sắp xếp: Cũ nhất" value="date_asc" />
                <Picker.Item label="Sắp xếp: Tổng tiền cao-thấp" value="total_desc" />
                <Picker.Item label="Sắp xếp: Tổng tiền thấp-cao" value="total_asc" />
              </Picker>
            </View>
            <View style={styles.dateFilterContainer}>
                <TouchableOpacity style={styles.dateInput} onPress={() => setOpenStartDatePicker(true)}>
                    <Text style={startDate ? styles.dateText : styles.placeholderText}>
                        {startDate ? `Từ: ${formatDate(startDate)}` : 'Từ ngày'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dateInput} onPress={() => setOpenEndDatePicker(true)}>
                    <Text style={endDate ? styles.dateText : styles.placeholderText}>
                        {endDate ? `Đến: ${formatDate(endDate)}` : 'Đến ngày'}
                    </Text>
                </TouchableOpacity>
            </View>

            <DatePicker
                modal
                open={openStartDatePicker}
                date={startDate || new Date()}
                mode="date"
                onConfirm={(date) => {
                    setOpenStartDatePicker(false);
                    setStartDate(date);
                }}
                onCancel={() => {
                    setOpenStartDatePicker(false);
                }}
                title="Chọn ngày bắt đầu"
                confirmText="Xác nhận"
                cancelText="Hủy"
            />
            <DatePicker
                modal
                open={openEndDatePicker}
                date={endDate || new Date()}
                mode="date"
                onConfirm={(date) => {
                    setOpenEndDatePicker(false);
                    setEndDate(date);
                }}
                onCancel={() => {
                    setOpenEndDatePicker(false);
                }}
                title="Chọn ngày kết thúc"
                confirmText="Xác nhận"
                cancelText="Hủy"
            />

             <View style={{marginVertical: 5}}>
                <Button title="Xóa bộ lọc" onPress={() => { setStartDate(null); setEndDate(null); setSortOption('date_desc')}} />
             </View>
            <Button title="Xóa toàn bộ lịch sử" onPress={handleClearHistory} color="#e74c3c"/>
          </View>
          <FlatList
            data={filteredAndSortedInvoices}
            renderItem={renderReceipt}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không tìm thấy hóa đơn phù hợp.</Text>
                </View>
            }
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
    backgroundColor: '#f5f7fb',
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
  controlsContainer: {
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#eef2f7',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e6edf8',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#e6edf8',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    backgroundColor: '#fafbfd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dateText: {
    color: '#111827',
  },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  list: { padding: 12, paddingBottom: 80 },
  receiptContainer: {
    backgroundColor: 'white',
    padding: 14,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  receiptHeader: { textAlign: 'center', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  receiptDate: { textAlign: 'center', fontSize: 13, color: '#555', marginBottom: 8 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e6edf8', marginVertical: 8 },
  tableHeader: { flexDirection: 'row' },
  tableRow: { flexDirection: 'row', marginVertical: 2 },
  tableCell: { fontSize: 13, color: '#111827' },
  tableHeader_Name: { flex: 3, fontWeight: '700' },
  tableHeader_Qty: { flex: 1, textAlign: 'center', fontWeight: '700' },
  tableHeader_Price: { flex: 2, textAlign: 'right', fontWeight: '700' },
  tableHeader_Total: { flex: 2, textAlign: 'right', fontWeight: '700' },
  table_Name: { flex: 3 },
  table_Qty: { flex: 1, textAlign: 'center' },
  table_Price: { flex: 2, textAlign: 'right' },
  table_Total: { flex: 2, textAlign: 'right', fontWeight: '700' },
  totalContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, alignItems: 'center' },
  totalText: { fontSize: 15, fontWeight: '700' },
  totalAmount: { fontSize: 16, fontWeight: '800', marginLeft: 10, color: '#ef4444' },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6edf8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  secondaryButtonText: { color: '#2563eb', fontWeight: '700' },
  destructiveButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  destructiveButtonText: { color: '#ef4444', fontWeight: '700' },
});