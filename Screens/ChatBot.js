import { StyleSheet, Text, View, Button, TextInput, KeyboardAvoidingView, Platform} from 'react-native';

export default function ChatBot() {
    return(
        <View style={styles.container}>
            <Text style={styles.text}>Chat bot</Text>
        </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
  })