import { useState } from 'react';

const getInitialData = (key, mockData) => {
  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      return JSON.parse(storedData);
    }
    localStorage.setItem(key, JSON.stringify(mockData));
    return mockData;
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
    return mockData;
  }
};

const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage for key "${key}":`, error);
  }
};

const useCrud = (storageKey, initialData) => {
  const [state, setState] = useState(() => getInitialData(storageKey, initialData));

  const add = (item) => {
    const newItem = { ...item, id: `${storageKey.slice(5, 9)}-${Date.now()}` };
    if (Array.isArray(state)) {
      const updatedState = [...state, newItem];
      setState(updatedState);
      saveData(storageKey, updatedState);
    } else {
       console.error("Cannot add item to a non-array state in useCrud.");
    }
    return newItem;
  };

  const update = (updatedItem) => {
    if (Array.isArray(state)) {
      const updatedState = state.map(item =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      );
      setState(updatedState);
      saveData(storageKey, updatedState);
    } else {
      const updatedState = { ...state, ...updatedItem };
      setState(updatedState);
      saveData(storageKey, updatedState);
    }
    return updatedItem;
  };

  const remove = (itemId) => {
     if (Array.isArray(state)) {
      const updatedState = state.filter(item => item.id !== itemId);
      setState(updatedState);
      saveData(storageKey, updatedState);
    }
  };

  return { state, add, update, remove };
};

export default useCrud;