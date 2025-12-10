import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, {useState, useEffect, useMemo, useCallback, useLayoutEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';

// Copied from AddScreen/DetailScreen
const CATEGORIES = [
  'Hàng tiêu dùng nhanh',
  'Điện tử – Công nghệ',
  'Điện lạnh – Điện gia dụng',
  'Thời trang – Phụ kiện',
  'Sức khỏe – Làm đẹp',
  'Đồ mẹ và bé',
  'Nội thất – Trang trí',
  'Thể thao – Dã ngoại',
  'Ô tô – Xe máy – Công cụ',
  'Sách – Văn phòng phẩm',
  'Nông sản – Thực phẩm',
  'Dịch vụ',
];

const HomeScreen = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOption, setSortOption] = useState('date_desc');

  const navigation = useNavigation();

  // Set up header search bar
  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        placeholder: "Tìm kiếm sản phẩm...",
        onChangeText: (event) => setSearchTerm(event.nativeEvent.text),
      },
    });
  }, [navigation, setSearchTerm]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      // Filter out keys that are for invoices
      const productKeys = allKeys.filter(key => !key.startsWith('invoice_'));
      const items = await AsyncStorage.multiGet(productKeys);
      const loadedProducts = items
        .map(item => {
          try {
            if (item[1]) {
              return JSON.parse(item[1]);
            }
            return null;
          } catch (e) {
            console.warn(`Could not parse item with key ${item[0]}`);
            return null;
          }
        })
        .filter(p => p && p.id); // Ensure product is valid
      setAllProducts(loadedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  const filteredAndSortedProducts = useMemo(() => {
    let products = [...allProducts];

    // Filter by Category
    if (categoryFilter !== 'All') {
      products = products.filter(p => p.category === categoryFilter);
    }
    
    // Filter by Status
    if (statusFilter !== 'All') {
      const isActive = statusFilter === 'Active';
      products = products.filter(p => p.is_active === isActive);
    }

    // Filter by Search Term
    if (searchTerm) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort
    switch (sortOption) {
      case 'name_asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        products.sort((a, b) => a.standard_price - b.standard_price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.standard_price - a.standard_price);
        break;
      case 'date_desc':
        products.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
        break;
      default:
        break;
    }

    return products;
  }, [allProducts, searchTerm, categoryFilter, statusFilter, sortOption]);

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.productContainer}
      onPress={() => navigation.navigate('DetailScreen', {product: item})}>
      {item.image ? (
        <Image source={{uri: item.image}} style={styles.productImage} />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>
          {item.standard_price?.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
          })}
        </Text>
        <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: item.is_active ? '#2ecc71' : '#e74c3c' }]} />
            <Text style={styles.statusText}>{item.is_active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (allProducts.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Chưa có sản phẩm nào.</Text>
        <Text style={styles.emptySubtitle}>Bắt đầu bằng cách quét mã sản phẩm để thêm vào kho</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('QrScan')}>
          <Text style={styles.primaryButtonText}>Thêm sản phẩm đầu tiên</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.controlsContainer}>
        <View style={styles.pickerRow}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryFilter}
              onValueChange={itemValue => setCategoryFilter(itemValue)}>
              <Picker.Item label="Tất cả danh mục" value="All" />
              {CATEGORIES.map(cat => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={statusFilter}
              onValueChange={itemValue => setStatusFilter(itemValue)}>
              <Picker.Item label="Tất cả trạng thái" value="All" />
              <Picker.Item label="Hoạt động (Active)" value="Active" />
              <Picker.Item label="Không hoạt động (Inactive)" value="Inactive" />
            </Picker>
          </View>
        </View>
        <View style={[styles.pickerRow, {marginTop: 10}]}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sortOption}
              onValueChange={itemValue => setSortOption(itemValue)}>
              <Picker.Item label="Sắp xếp: Mới nhất" value="date_desc" />
              <Picker.Item label="Sắp xếp: Tên A-Z" value="name_asc" />
              <Picker.Item label="Sắp xếp: Tên Z-A" value="name_desc" />
              <Picker.Item label="Sắp xếp: Giá thấp-cao" value="price_asc" />
              <Picker.Item label="Sắp xếp: Giá cao-thấp" value="price_desc" />
            </Picker>
          </View>
        </View>
      </View>
      <FlatList
        data={filteredAndSortedProducts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm phù hợp.</Text>
            </View>
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6f9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 18,
  },
  controlsContainer: {
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#eef2f7',
  },
  searchInput: {
    height: 42,
    borderWidth: 1,
    borderColor: '#e6edf8',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#fafbfd',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e6edf8',
    borderRadius: 10,
    marginHorizontal: 4,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  list: {
    padding: 12,
    paddingBottom: 120,
  },
  productContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#eef2f8',
  },
  productInfo: {
    marginLeft: 15,
    justifyContent: 'space-around',
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  productPrice: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#64748b',
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
  headerLeft: { width: 80, alignItems: 'flex-start' },
  headerRight: { width: 80, alignItems: 'flex-end' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerAction: { color: '#2563eb', fontSize: 14 },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#6b7280' },
  primaryButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});
