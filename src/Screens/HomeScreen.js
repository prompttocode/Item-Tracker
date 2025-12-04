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
  Button,
} from 'react-native';
import React, {useState, useEffect, useMemo, useCallback} from 'react';
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
  const [sortOption, setSortOption] = useState('date_desc');

  const navigation = useNavigation();

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
  }, [allProducts, searchTerm, categoryFilter, sortOption]);

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
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Chưa có sản phẩm nào.</Text>
        <View style={{marginTop: 20}}>
            <Button 
                title="Thêm sản phẩm đầu tiên" 
                onPress={() => navigation.navigate('QrScan')}
            />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên sản phẩm..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
  controlsContainer: {
    padding: 10,
    backgroundColor: 'white',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  list: {
    padding: 10,
  },
  productContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  productInfo: {
    marginLeft: 15,
    justifyContent: 'center',
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
});
