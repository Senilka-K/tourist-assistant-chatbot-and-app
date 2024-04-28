import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { storeUserId } from "../UserIdStore";
import { useTranslation } from 'react-i18next';

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({});
  const [loginSuccess, setLoginSuccess] = useState("");

  const validateForm = () => {
    let errors = {};

    if (!username) errors.username = t('username_error_message');

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => { 
    if (validateForm()) {
      try {
        const response = await fetch('https://piglet-vital-alien.ngrok-free.app/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username })
        });

        const data = await response.json();

        if (response.status === 200) {
          setLoginSuccess(`${username} logged in successfully`);
          storeUserId(data.user);
          setUsername("");
          setErrors({});
        } else {
          setLoginSuccess("");
          Alert.alert("Login Failed", data.message);
        }
      } catch (error) {
        setLoginSuccess("");
        Alert.alert("Network Error", "Unable to connect to server");
      }
    } else {
      setLoginSuccess("");
    }
  };

  const { t } = useTranslation();

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={styles.container}
    >
      <Text style={styles.text}>{t('welcome_message')}</Text>
      <View style={styles.form}>
        <Text style={styles.label}>{t('Username')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('Username_placeholder')}
          value={username}
          onChangeText={setUsername}
        />
        {errors.username ? (
          <Text style={styles.errorText}>{errors.username}</Text>
        ) : null}
        <View style={styles.actionButtonGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSubmit}>
            <Text style={styles.actionButtonText}>{t('login_button')}</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  form: {
    backgroundColor: "white",
    padding: 20,
    width: screenWidth - 70,
    borderRadius: 10,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center"
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
  actionButtonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "grey",
    padding: 10,
    width: screenWidth - 250,
    alignItems: "center",
    borderRadius: 5,
  },
  actionButtonText: {
    fontSize: 18,
    color: "#fff",
  },
});