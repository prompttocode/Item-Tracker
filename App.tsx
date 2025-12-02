import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import TabBar from './src/components/TabBar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddScreen from './src/Screens/AddScreen';

const App = () => {
  const Stack = createNativeStackNavigator()
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TabMain">
        <Stack.Screen 
          name="TabMain" 
          component={TabBar}
          options={{ headerShown: false }} // Ẩn header cho TabBar
        />
        <Stack.Screen 
          name="AddScreen" 
          component={AddScreen}
          options={{ headerShown: false }} // Ẩn header cho TabBar
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})