
import React, {createContext, useState, useReducer} from 'react';

export const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingProductIndex = state.findIndex(
        item => item.id === action.payload.id,
      );
      if (existingProductIndex > -1) {
        const updatedCart = [...state];
        updatedCart[existingProductIndex].quantity += 1;
        return updatedCart;
      } else {
        return [...state, {...action.payload, quantity: 1}];
      }
    case 'UPDATE_QUANTITY':
      return state.map(item =>
        item.id === action.payload.id
          ? {...item, quantity: action.payload.quantity}
          : item,
      ).filter(item => item.quantity > 0);
    case 'REMOVE_FROM_CART':
        return state.filter(item => item.id !== action.payload.id);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
};

export const CartProvider = ({children}) => {
  const [state, dispatch] = useReducer(cartReducer, []);

  const addToCart = product => {
    dispatch({type: 'ADD_TO_CART', payload: product});
  };

  const updateQuantity = (id, quantity) => {
    dispatch({type: 'UPDATE_QUANTITY', payload: {id, quantity}});
  };

  const removeFromCart = (id) => {
    dispatch({type: 'REMOVE_FROM_CART', payload: {id}});
  };

  const clearCart = () => {
    dispatch({type: 'CLEAR_CART'});
  };

  return (
    <CartContext.Provider
      value={{cart: state, addToCart, updateQuantity, removeFromCart, clearCart}}>
      {children}
    </CartContext.Provider>
  );
};
