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
import { useTranslation } from "react-i18next";
import { NGROK_STATIC_DOMAIN } from '@env';
import { ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserId();
      if (userId) {
        setUserId(userId);
        try {
          const response = await fetch(
            `${NGROK_STATIC_DOMAIN}/formData`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userId }),
            }
          );

          const data = await response.json();

          if (response.status === 200) {
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
            setName("");
            setArriveDate("");
            setDistrict("");
            setContactNo("");
            setPassportId("");
            setEmergencyNo("");
            setComment("");
            setLikesTracking(null);
            setIsFormFilled(false);
            setIsEditable(true);
          }
        } catch (error) {
          console.error("Error!", error);
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
      likesTracking,
    };

    const endpoint = isFormFilled
      ? `${NGROK_STATIC_DOMAIN}/edit-form`
      : `${NGROK_STATIC_DOMAIN}/submit-form`;
    const method = isFormFilled ? "PUT" : "POST";

    try {
      console.log(JSON.stringify(formData));
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseJson = await response.json();
      if (response.ok) {
        setIsEditable(false);
        setIsFormFilled(true);
        Alert.alert(
          t("success_alert"),
          isFormFilled
            ? t("form_success_alert_update")
            : t("form_success_alert_submission")
        );
      } else {
        throw new Error(responseJson.message);
      }
    } catch (error) {
      console.error("Submission failed", error);
      Alert.alert(
        t("form_failed_alert"),
        isFormFilled
          ? t("form_failed_alert_update")
          : t("form_failed_alert_submission")
      );
    }
  };

  const handleEdit = async () => {
    const id = await getUserId();
    console.log(id);
    setIsEditable(true);
    Alert.alert(t("error_alert"), t("form_edit_alert_message"));
  };

  const handleDelete = () => {
    Alert.alert(
      t("form_delete_alert"),
      t("form_delete_alert_message"),
      [
        { text: t("no"), style: "cancel" },
        {
          text: t("yes"),
          onPress: () => {
            deleteFormData();
            console.log("Information Deleted");
          },
        },
      ],
      { cancelable: false }
    );
  };

  const deleteFormData = async () => {
    const userId = await getUserId();
    if (userId) {
      try {
        const response = await fetch(
          `${NGROK_STATIC_DOMAIN}/delete-form`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          }
        );

        const responseData = await response.json();
        if (response.ok) {
          setName("");
          setArriveDate("");
          setDistrict("");
          setContactNo("");
          setPassportId("");
          setEmergencyNo("");
          setComment("");
          setLikesTracking(null);
          setIsFormFilled(false);
          setIsEditable(true);
          console.log("Form data deleted successfully");
          Alert.alert(t("success_alert"), t("form_delete_success_alert_message"));
        } else {
          throw new Error(responseData.message);
        }
      } catch (error) {
        console.error("Error deleting form data:", error);
        Alert.alert(t("error_alert"), t("form_delete_failed_alert_message"));
      }
    } else {
      Alert.alert(t("error_alert"), t("userId_error_message"));
    }
  };
  const { t } = useTranslation();

  // Function to toggle recording
  const toggleRecording = async (field) => {
    setActiveField(field);  // Set the active field

    if (isRecording) {

      const transcription = await stopRecording(recording);
      changeFieldValue(transcription, field);
      setIsTranscribing(false);
      // setIsRecording(false);
      console.log("Recording completed");
    } 
    else {
      const newRecording = await startRecording();
      if (newRecording) {
        setRecording(newRecording);
        setIsRecording(true);
        console.log("Recording started");
      }
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access microphone is required!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      return recording;
    } 
    catch (error) {
      console.error('Failed to start recording:', error);
      return;
    }
  };

  // Stop recording
  const stopRecording = async (recording) => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = await recording.getURI();
      setIsRecording(false);
      setIsTranscribing(true);
      setRecording(null);
  
      // Transcribe audio
      const transcriptionResult = await sendAudioForTranscription(uri);
      return transcriptionResult["Result"];

    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const sendAudioForTranscription = async (uri) => {
    const formData = new FormData();
    // Append the file to the formData object
    formData.append('audioFile', {
      uri: uri,
      type: 'audio/mp4', // Correct MIME type for m4a files
      name: 'recording.m4a' // Change the file extension to .m4a
    });

    try {
      const response = await fetch(`${NGROK_STATIC_DOMAIN}/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = await response.json();
      return result; 
    }
    catch (error) {
      console.error('Error uploading file:', error);
    }
  }
  
  const changeFieldValue = (value, field) => {
    switch (field) {
      case "name":
        setName(value);
        break;
      case "arriveDate":
        setArriveDate(value);
        break;
      case "district":
        setDistrict(value);
        break;
      case "contactNo":
        setContactNo(value);
        break;
      case "passportId":
        setPassportId(value);
        break;
      case "emergencyNo":
        setEmergencyNo(value);
        break;
      case "comment":
        setComment(value);
        break;
      }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.container}>
          <Text style={styles.text}>{t("application_form")}</Text>
          <View style={styles.form}>


            <Text style={styles.label}>{t("application_name")}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t("application_name_placeholder")}
                value={name}
                onChangeText={setName}
                editable={isEditable}
              />
              {isTranscribing && activeField === 'name' && (
                <ActivityIndicator size="small" color="grey" />
              )}
              <TouchableOpacity
                style={[styles.micButton, isRecording && activeField === 'name' ? styles.micButtonSelected : null]}
                onPress={() => toggleRecording('name')}
                disabled={!isEditable || isTranscribing}
              >
                <View style={styles.iconCircle}>
                  <Icon
                    name="mic"
                    size={20}
                    color={isRecording && activeField === 'name' ? 'red' : 'gray'}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}


            <Text style={styles.label}>{t("application_arrive_date")}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t("application_arrive_date_placeholder")}
                value={arriveDate}
                onChangeText={setArriveDate}
                editable={isEditable}
              />
              {isTranscribing && activeField === 'arriveDate' && (
                <ActivityIndicator size="small" color="grey" />
              )}
              <TouchableOpacity
                style={[styles.micButton, isRecording && activeField === 'arriveDate' ? styles.micButtonSelected : null]}
                onPress={() => toggleRecording('arriveDate')}
                disabled={!isEditable || isTranscribing}
              >
                <View style={styles.iconCircle}>
                  <Icon
                    name="mic"
                    size={20}
                    color={isRecording && activeField === 'arriveDate' ? 'red' : 'gray'}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {errors.arriveDate ? (
              <Text style={styles.errorText}>{errors.arriveDate}</Text>
            ) : null}


            <Text style={styles.label}>{t("application_district")}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t("application_district_placeholder")}
                value={district}
                onChangeText={setDistrict}
                editable={isEditable}
              />
              {isTranscribing && activeField === 'district' && (
                <ActivityIndicator size="small" color="grey" />
              )}
              <TouchableOpacity
                style={[styles.micButton, isRecording && activeField === 'district' ? styles.micButtonSelected : null]}
                onPress={() => toggleRecording('district')}
                disabled={!isEditable || isTranscribing}
              >
                <View style={styles.iconCircle}>
                  <Icon
                    name="mic"
                    size={20}
                    color={isRecording && activeField === 'district' ? 'red' : 'gray'}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {errors.district ? (
              <Text style={styles.errorText}>{errors.district}</Text>
            ) : null}


            <Text style={styles.label}>{t("application_contact_no")}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t("application_contact_no_placeholder")}
                value={contactNo}
                onChangeText={setContactNo}
                editable={isEditable}
              />
              {isTranscribing && activeField === 'contactNo' && (
                <ActivityIndicator size="small" color="grey" />
              )}
              <TouchableOpacity
                style={[styles.micButton, isRecording && activeField === 'contactNo' ? styles.micButtonSelected : null]}
                onPress={() => toggleRecording('contactNo')}
                disabled={!isEditable || isTranscribing}
              >
                <View style={styles.iconCircle}>
                  <Icon
                    name="mic"
                    size={20}
                    color={isRecording && activeField === 'contactNo' ? 'red' : 'gray'}
                  />
                </View>
              </TouchableOpacity>
            </View>
            
            {errors.contactNo ? (
              <Text style={styles.errorText}>{errors.contactNo}</Text>
            ) : null}


            <Text style={styles.label}>{t("application_passport_id")}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t("application_passport_id_placeholder")}
                value={passportId}
                onChangeText={setPassportId}
                editable={isEditable}
              />
              {isTranscribing && activeField === 'passportId' && (
                <ActivityIndicator size="small" color="grey" />
              )}
              <TouchableOpacity
                style={[styles.micButton, isRecording && activeField === 'passportId' ? styles.micButtonSelected : null]}
                onPress={() => toggleRecording('passportId')}
                disabled={!isEditable || isTranscribing}
              >
                <View style={styles.iconCircle}>
                  <Icon
                    name="mic"
                    size={20}
                    color={isRecording && activeField === 'passportId' ? 'red' : 'gray'}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {errors.passportId ? (
              <Text style={styles.errorText}>{errors.passportId}</Text>
            ) : null}


            <Text style={styles.label}>{t("application_emergency_no")}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t("application_emergency_no_placeholder")}
                value={emergencyNo}
                onChangeText={setEmergencyNo}
                editable={isEditable}
              />
              {isTranscribing && activeField === 'emergencyNo' && (
                <ActivityIndicator size="small" color="grey" />
              )}
              <TouchableOpacity
                style={[styles.micButton, isRecording && activeField === 'emergencyNo' ? styles.micButtonSelected : null]}
                onPress={() => toggleRecording('emergencyNo')}
                disabled={!isEditable || isTranscribing}
              >
                <View style={styles.iconCircle}>
                  <Icon
                    name="mic"
                    size={20}
                    color={isRecording && activeField === 'emergencyNO' ? 'red' : 'gray'}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {errors.emergencyNo ? (
              <Text style={styles.errorText}>{errors.emergencyNo}</Text>
            ) : null}
            
            
            <Text style={styles.label}>{t("application_comment")}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t("application_comment_placeholder")}
                value={comment}
                onChangeText={setComment}
                editable={isEditable}
              />
              {isTranscribing && activeField === 'comment' && (
                <ActivityIndicator size="small" color="grey" />
              )}
              <TouchableOpacity
                style={[styles.micButton, isRecording && activeField === 'comment' ? styles.micButtonSelected : null]}
                onPress={() => toggleRecording('comment')}
                disabled={!isEditable || isTranscribing}
              >
                <View style={styles.iconCircle}>
                  <Icon
                    name="mic"
                    size={20}
                    color={isRecording && activeField === 'comment' ? 'red' : 'gray'}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {errors.comment ? (
              <Text style={styles.errorText}>{errors.comment}</Text>
            ) : null}
            
            
            <Text style={styles.label}>{t("application_tracking")}</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.button,
                  likesTracking === "yes" ? styles.buttonSelected : null,
                ]}
                onPress={() => setLikesTracking("yes")}
                editable={isEditable} 
              >
                <Text style={styles.buttonText}>
                  {t("yes")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  likesTracking === "no" ? styles.buttonSelected : null,
                ]}
                onPress={() => setLikesTracking("no")}
                editable={isEditable}
              >
                <Text style={styles.buttonText}>
                  {t("no")}
                </Text>
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
                <Text style={styles.actionButtonText}>
                  {t("application_done")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
                disabled={!isFormFilled}
              >
                <Text style={styles.actionButtonText}>
                  {t("application_edit")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDelete}
                disabled={!isFormFilled}
              >
                <Text style={styles.actionButtonText}>
                  {t("application_delete")}
                </Text>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 10, 
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 40,
    padding: 10,
    borderRadius: 5,
  },
  micButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonSelected: {
    backgroundColor: 'white',
  },
  iconCircle: {
    backgroundColor: 'white', 
    borderRadius: 15, 
    width: 30, 
    height: 30,
    borderColor: "black",
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: screenWidth - 300,
    alignItems: "center",
    borderRadius: 5,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#fff",
  },
});