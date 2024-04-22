import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, KeyboardAvoidingView, Platform} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';


export default function HomeScreen({ navigation }) {
    const [username, setUsername] = useState("");
    const [errors, setErrors] = useState({});
    const [loginSuccess, setLoginSuccess] = useState("");
  
    const validateForm = () => {
      let errors = {};
  
      if (!username) errors.username = "Username is required";
    //   if (!password) errors.password = "Password is required";
  
      setErrors(errors);
  
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            console.log("Login Successful", username);
            setLoginSuccess(`${username} logged in successfully`);
            // Resetting the form states
            setUsername("");
            // setPassword("");
            setErrors({});
        } else {
            setLoginSuccess(""); // Clear success message if login fails
        }
    };
  
    return (
      <KeyboardAvoidingView behavior='padding' keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} style={styles.container}>
        <Text style={styles.text}>Home</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} placeholder='Enter your username' value={username} onChangeText={setUsername}/>
          {
            errors.username ? <Text style={styles.errorText}>{errors.username}</Text> :null
          }
          {/* <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder='Enter your password' secureTextEntry value={password} onChangeText={setPassword } />
          {
            errors.password ? <Text style={styles.errorText}>{errors.password}</Text> :null
          } */}
          <Button title='Login' onPress={handleSubmit}/>
        </View>
        {loginSuccess && <Text style={styles.successText}>{loginSuccess}</Text>}
        <StatusBar style="auto" />
      </KeyboardAvoidingView>
      
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      backgroundColor: '#f5f5f5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    form: {
      backgroundColor: 'white',
      padding: 20,
      width: 300,
      borderRadius: 10,
      shadowColor: 'black',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
      fontWeight: "bold",
    },
    input: {
      height: 40,
      borderColor: "#ddd",
      borderWidth: 1,
      marginBottom: 15,
      padding: 10,
      borderRadius: 5,
    },
    errorText: {
      color: "red",
      marginBottom: 10,
    },
    successText: {
        padding: 20,
    },
  });