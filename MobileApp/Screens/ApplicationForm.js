import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { getUserId } from "../UserIdStore";
import { useIsFocused } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

export default function ApplicationForm() {
  const [name, setName] = useState("");
  const [arriveDate, setArriveDate] = useState("");
  const [district, setDistrict] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [passportId, setPassportId] = useState("");
  const [emergencyNo, setEmergencyNo] = useState("");
  const [comment, setComment] = useState("");
  const [likesTracking, setLikesTracking] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEditable, setIsEditable] = useState(true);
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [errors, setErrors] = useState({});

  const isFocused = useIsFocused();
  
    useEffect(() => {
  
      const fetchUserId = async () => {
        const userId = await getUserId();
        if (userId){
          setUserId(userId);
          try{
            const response = await fetch('https://piglet-vital-alien.ngrok-free.app/formData', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ userId })
            });
            
            const data = await response.json();
            
            if (response.status === 200){
              console.log("success", data);
              setName(data.name);
              setArriveDate(data.arriveDate);
              setDistrict(data.district);
              setContactNo(data.contactNo);
              setPassportId(data.passportId);
              setEmergencyNo(data.emergencyNo);
              setComment(data.comment);
              setLikesTracking(data.likesTracking);
              setIsFormFilled(true);
              setIsEditable(false);
              console.log("done");
            } else {
              setIsFormFilled(false);
              setIsEditable(true); 
            }
          } 
          catch (error) {
            console.error('Error!', error);
          }
        }
      };
  
      fetchUserId();
    }, [isFocused]);

  const handleDone = async () => {
    console.log(userId);
    const formData = {
        userId,
        name,
        arriveDate,
        district,
        contactNo,
        passportId,
        emergencyNo,
        comment,
        likesTracking
    };

    const endpoint = isFormFilled ? 'https://piglet-vital-alien.ngrok-free.app/edit-form' : 'https://piglet-vital-alien.ngrok-free.app/submit-form';
    const method = isFormFilled ? 'PUT' : 'POST';

    try {
        console.log(JSON.stringify(formData));
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const responseJson = await response.json();
        if (response.ok) {
            setIsEditable(false);
            setIsFormFilled(true);
            Alert.alert("Success", isFormFilled ? "Form updated successfully!" : "Form submitted successfully!");
        } else {
            throw new Error(responseJson.message);
        }
    } catch (error) {
        console.error("Submission failed", error); 
        Alert.alert("Error", "Failed to " + (isFormFilled ? "update" : "submit") + " form");
    }
};

  const handleEdit = async () => {
    const id = await getUserId();
    console.log(id);
    setIsEditable(true);
    Alert.alert("Edit", "You can now edit the form.");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this information?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: () => {
          deleteFormData();
          console.log("Information Deleted");
        }},
      ],
      { cancelable: false }
    );
  };

  const deleteFormData = async () => {
    const userId = await getUserId();
    if (userId) {
        try {
            const response = await fetch('https://piglet-vital-alien.ngrok-free.app/delete-form', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            const responseData = await response.json();
            if (response.ok) {
                setName('');
                setArriveDate('');
                setDistrict('');
                setContactNo('');
                setPassportId('');
                setEmergencyNo('');
                setComment('');
                setLikesTracking(null);
                setIsFormFilled(false);
                setIsEditable(true); 
                console.log('Form data deleted successfully');
                Alert.alert("Success", "Form data deleted successfully");
            } else {
                throw new Error(responseData.message);
            }
        } catch (error) {
            console.error("Error deleting form data:", error);
            Alert.alert("Error", "Failed to delete form data");
        }
    } else {
        Alert.alert("Error", "User ID is not available");
    }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.container}>
          <Text style={styles.text}>Application Form</Text>
          <View style={styles.form}>
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Name"
              value={name}
              onChangeText={setName}
              editable={isEditable} 
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
              editable={isEditable}
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
              editable={isEditable}
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
              editable={isEditable}
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
              editable={isEditable}
            />
            {errors.passportId ? (
              <Text style={styles.errorText}>{errors.passportId}</Text>
            ) : null}
            <Text style={styles.label}>Emergency No:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Emergency No"
              value={emergencyNo}
              onChangeText={setEmergencyNo}
              editable={isEditable}
            />
            {errors.emergencyNo ? (
              <Text style={styles.errorText}>{errors.emergencyNo}</Text>
            ) : null}
            <Text style={styles.label}>Comment:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Comment"
              value={comment}
              onChangeText={setComment}
              editable={isEditable}
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
                editable={isEditable}
              >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  likesTracking === "no" ? styles.buttonSelected : null,
                ]}
                onPress={() => setLikesTracking("no")}
                editable={isEditable}
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
            {errors.likesTracking ? (
              <Text style={styles.errorText}>{errors.likesTracking}</Text>
            ) : null}
            <View style={styles.actionButtonGroup}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDone}
              >
                <Text style={styles.actionButtonText}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
                disabled={!isFormFilled}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDelete}
                disabled={!isFormFilled}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    paddingTop: 20,
    marginBottom: 16,
  },
  form: {
    backgroundColor: "white",
    padding: 20,
    width: screenWidth - 50,
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
    justifyContent: "space-between",
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
