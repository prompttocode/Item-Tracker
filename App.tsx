import { RootSiblingParent } from 'react-native-root-siblings';
import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartProvider } from './src/context/CartContext';

import TabBar from './src/components/TabBar';
import AddScreen from './src/Screens/AddScreen';
import BillScreen from './src/Screens/BillScreen';
import DetailScreen from './src/Screens/DetailScreen';
import CartIcon from './src/components/CartIcon';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <RootSiblingParent>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="TabMain"
            screenOptions={{
              headerTintColor: '#007bff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          >
            <Stack.Screen
              name="TabMain"
              component={TabBar}
              options={{
                headerShown: false, // Hide header for the TabBar component itself, as tab screens will have their own headers.
              }}
            />
            <Stack.Screen
              name="AddScreen"
              component={AddScreen}
              options={{ title: 'Thêm sản phẩm' }}
            />
            <Stack.Screen
              name="BillScreen"
              component={BillScreen}
              options={{ 
                title: 'Hóa đơn',
                presentation: 'modal', // Open as a modal
              }}
            />
            <Stack.Screen
              name="DetailScreen"
              component={DetailScreen}
              options={{ title: 'Chi tiết sản phẩm' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </RootSiblingParent>
  );
};

export default App;

const styles = StyleSheet.create({});