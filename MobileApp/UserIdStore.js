import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeUserId = async (userId) => {
  try {
    await AsyncStorage.setItem('userId', userId);
    console.log('User ID stored successfully', userId);
  } catch (e) {
    console.error('Failed to save userId:', e);
  }
};

export const getUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    console.log('User ID is ready to return', userId);
    return userId !== null ? userId : null;
  } catch (e) {
    console.error('Failed to retrieve userId:', e);
    return null;
  }
};
