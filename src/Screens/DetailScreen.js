import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Switch,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import {launchImageLibrary} from 'react-native-image-picker';

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

const DetailScreen = ({route}) => {
  const navigation = useNavigation();
  const initialProduct = route.params?.product;

  const [product, setProduct] = useState(initialProduct);

  useEffect(() => {
    if (route.params?.product) {
      setProduct(route.params.product);
    }
  }, [route.params?.product]);

  if (!product) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Vui lòng chọn một sản phẩm từ màn hình chính.</Text>
      </View>
    );
  }

  const handleInputChange = (field, value) => {
    setProduct(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleNumericChange = (field, text) => {
    const numericValue = parseFloat(text.replace(/,/g, ''));
    if (!isNaN(numericValue)) {
      handleInputChange(field, numericValue);
    } else if (text === '') {
      handleInputChange(field, 0);
    }
  };

  const handleSelectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Lỗi', 'Không thể chọn ảnh.');
      } else if (response.assets && response.assets.length > 0) {
        handleInputChange('image', response.assets[0].uri);
      }
    });
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(product.id, JSON.stringify(product));
      Alert.alert('Thành công', 'Sản phẩm đã được cập nhật.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('Failed to save product:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật sản phẩm.');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(product.id);
              Alert.alert('Thành công', 'Sản phẩm đã được xóa.', [
                {
                  text: 'OK',
                  onPress: () => {
                    setProduct(null);
                    navigation.goBack();
                  },
                },
              ]);
            } catch (error) {
              console.error('Failed to delete product:', error);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm.');
            }
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  };

  const formatDate = dateString => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={handleSelectImage}>
          {product.image ? (
            <Image source={{uri: product.image}} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text>Chọn ảnh</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.name}
            value={product.name}
            onChangeText={text => handleInputChange('name', text)}
            placeholder="Tên sản phẩm"
          />

          <View style={styles.detailItem}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.value}>{product.id}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.label}>Danh mục:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={product.category}
                onValueChange={itemValue =>
                  handleInputChange('category', itemValue)
                }>
                {CATEGORIES.map(cat => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.label}>Mô tả:</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={product.description || ''}
              onChangeText={text => handleInputChange('description', text)}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.label}>Giá bán:</Text>
            <TextInput
              style={[styles.input, styles.price]}
              value={product.standard_price.toString()}
              onChangeText={text =>
                handleNumericChange('standard_price', text)
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.label}>Giá nhập:</Text>
            <TextInput
              style={[styles.input, styles.price]}
              value={product.standard_cost.toString()}
              onChangeText={text => handleNumericChange('standard_cost', text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.label}>Ngày tạo:</Text>
            <Text style={styles.value}>{formatDate(product.date_created)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.label}>Trạng thái:</Text>
            <Switch
              value={product.is_active}
              onValueChange={value => handleInputChange('is_active', value)}
            />
          </View>
          <View style={styles.actionsContainer}>
            <View style={styles.buttonWrapper}>
                <Button title="Lưu thay đổi" onPress={handleSave} color="#27ae60" />
            </View>
            <View style={styles.buttonWrapper}>
                <Button title="Xóa sản phẩm" onPress={handleDelete} color="#e74c3c" />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 400,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 10,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  input: {
    fontSize: 16,
    color: '#333',
    flex: 2,
    textAlign: 'right',
    paddingVertical: 4,
  },
   pickerContainer: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  multilineInput: {
    textAlign: 'left',
    height: 80,
    textAlignVertical: 'top',
  },
  price: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  actionsContainer: {
      marginTop: 20,
      marginBottom: 40,
  },
  buttonWrapper: {
      marginTop: 10,
  }
});
