import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  TouchableOpacity,
  Image
} from 'react-native';
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

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

const AddScreen = ({ route }) => {
  const { id } = route.params;
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [standardPrice, setStandardPrice] = useState('');
  const [standardCost, setStandardCost] = useState('');

  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Lỗi', 'Không thể chọn ảnh.');
      } else {
        if (response.assets && response.assets.length > 0) {
          setImage(response.assets[0].uri);
        }
      }
    });
  };

  const handleSaveProduct = async () => {
    if (!name || !standardPrice || !standardCost) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    try {
      const existingProduct = await AsyncStorage.getItem(id);
      if (existingProduct !== null) {
        Alert.alert('Lỗi', 'Sản phẩm với ID này đã tồn tại.');
        return;
      }

      const product = {
        id,
        name,
        category,
        description,
        image,
        date_created: new Date().toISOString(),
        is_active: isActive,
        standard_price: parseFloat(standardPrice),
        standard_cost: parseFloat(standardCost),
      };

      await AsyncStorage.setItem(id, JSON.stringify(product));
      Alert.alert('Thành công', 'Sản phẩm đã được lưu.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Failed to save product:', error);
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Thêm Sản Phẩm</Text>

      <Text style={styles.label}>ID Sản phẩm (từ mã QR)</Text>
      <TextInput style={styles.input} value={id} editable={false} />

      <Text style={styles.label}>Tên sản phẩm </Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nhập tên sản phẩm"
      />

      <Text style={styles.label}>Danh mục</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={itemValue => setCategory(itemValue)}>
          {CATEGORIES.map(cat => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={styles.inputMulti}
        value={description}
        onChangeText={setDescription}
        placeholder="Mô tả sản phẩm"
        multiline
      />

      <Text style={styles.label}>Giá bán</Text>
      <TextInput
        style={styles.input}
        value={standardPrice}
        onChangeText={setStandardPrice}
        placeholder="Nhập giá bán"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Giá nhập</Text>
      <TextInput
        style={styles.input}
        value={standardCost}
        onChangeText={setStandardCost}
        placeholder="Nhập giá nhập"
        keyboardType="numeric"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Trạng thái (Active)</Text>
        <Switch value={isActive} onValueChange={setIsActive} />
      </View>

      <Text style={styles.label}>Hình ảnh</Text>
      <TouchableOpacity style={styles.imageContainer} onPress={handleSelectImage}>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        {!image && <Text style={styles.imagePlaceholder}>Chọn ảnh</Text>}
      </TouchableOpacity>

      <Text style={styles.label}>Ngày tạo</Text>
      <TextInput
        style={styles.input}
        value={new Date().toLocaleDateString()}
        editable={false}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
        <Text style={styles.saveButtonText}>Lưu sản phẩm</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputMulti: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
    width: 150,
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  imagePlaceholder: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
