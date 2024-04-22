import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useState } from "react";

export default function ApplicationForm() {
  const [name, setName] = useState("");
  const [arriveDate, setArriveDate] = useState("");
  const [district, setDistrict] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [passportId, setPassportId] = useState("");
  const [comment, setComment] = useState("");
  const [likesTracking, setLikesTracking] = useState(null);
  const [errors, setErrors] = useState({});

  const handleDone = () => {
    if (!name || !arriveDate || !district || !contactNo || !passportId) {
      Alert.alert("Error", "Please fill in all fields.");
    } else {
      Alert.alert("Success", "Form Submitted Successfully!");
    }
  };

  const handleEdit = () => {
    Alert.alert("Edit", "You can now edit the form.");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this information?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: () => console.log("Information Deleted") },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Application Form</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Name"
          value={name}
          onChangeText={setName}
        />
        {errors.name ? (
          <Text style={styles.errorText}>{errors.name}</Text>
        ) : null}
        <Text style={styles.label}>Arrive Date:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Arrival Date"
          value={arriveDate}
          onChangeText={setArriveDate}
        />
        {errors.arriveDate ? (
          <Text style={styles.errorText}>{errors.arriveDate}</Text>
        ) : null}
        <Text style={styles.label}>Hope to go district:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your hope to go district"
          value={district}
          onChangeText={setDistrict}
        />
        {errors.district ? (
          <Text style={styles.errorText}>{errors.district}</Text>
        ) : null}
        <Text style={styles.label}>Contact No:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Contact No"
          value={contactNo}
          onChangeText={setContactNo}
        />
        {errors.contactNo ? (
          <Text style={styles.errorText}>{errors.contactNo}</Text>
        ) : null}
        <Text style={styles.label}>Passport Id:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Passport Id"
          value={passportId}
          onChangeText={setPassportId}
        />
        {errors.passportId ? (
          <Text style={styles.errorText}>{errors.passportId}</Text>
        ) : null}
        <Text style={styles.label}>Comment:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Comment"
          value={comment}
          onChangeText={setComment}
        />
        {errors.comment ? (
          <Text style={styles.errorText}>{errors.comment}</Text>
        ) : null}
        <Text style={styles.label}>Do you like Tracking</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.button,
              likesTracking === "yes" ? styles.buttonSelected : null,
            ]}
            onPress={() => setLikesTracking("yes")}
          >
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              likesTracking === "no" ? styles.buttonSelected : null,
            ]}
            onPress={() => setLikesTracking("no")}
          >
            <Text style={styles.buttonText}>No</Text>
          </TouchableOpacity>
        </View>
        {errors.likesTracking ? (
          <Text style={styles.errorText}>{errors.likesTracking}</Text>
        ) : null}
        <View style={styles.actionButtonGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDone}>
            <Text style={styles.actionButtonText}>Done</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  form: {
    backgroundColor: "white",
    padding: 20,
    width: 300,
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
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#ddd",
    padding: 10,
    width: 100,
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    color: "#000",
  },
  buttonSelected: {
    backgroundColor: "#007BFF",
    color: "#fff",
  },
  actionButtonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "grey",
    padding: 10,
    width: 80,
    alignItems: "center",
    borderRadius: 5,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#fff",
  },
});
