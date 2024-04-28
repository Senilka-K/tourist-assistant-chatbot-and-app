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
      if (userId) {
        setUserId(userId);
        try {
          const response = await fetch(
            "https://piglet-vital-alien.ngrok-free.app/formData",
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
      ? "https://piglet-vital-alien.ngrok-free.app/edit-form"
      : "https://piglet-vital-alien.ngrok-free.app/submit-form";
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
          "https://piglet-vital-alien.ngrok-free.app/delete-form",
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
            <TextInput
              style={styles.input}
              placeholder={t("application_name_placeholder")}
              value={name}
              onChangeText={setName}
              editable={isEditable}
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
            <Text style={styles.label}>{t("application_arrive_date")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("application_arrive_date_placeholder")}
              value={arriveDate}
              onChangeText={setArriveDate}
              editable={isEditable}
            />
            {errors.arriveDate ? (
              <Text style={styles.errorText}>{errors.arriveDate}</Text>
            ) : null}
            <Text style={styles.label}>{t("application_district")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("application_district_placeholder")}
              value={district}
              onChangeText={setDistrict}
              editable={isEditable}
            />
            {errors.district ? (
              <Text style={styles.errorText}>{errors.district}</Text>
            ) : null}
            <Text style={styles.label}>{t("application_contact_no")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("application_contact_no_placeholder")}
              value={contactNo}
              onChangeText={setContactNo}
              editable={isEditable}
            />
            {errors.contactNo ? (
              <Text style={styles.errorText}>{errors.contactNo}</Text>
            ) : null}
            <Text style={styles.label}>{t("application_passport_id")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("application_passport_id_placeholder")}
              value={passportId}
              onChangeText={setPassportId}
              editable={isEditable}
            />
            {errors.passportId ? (
              <Text style={styles.errorText}>{errors.passportId}</Text>
            ) : null}
            <Text style={styles.label}>{t("application_emergency_no")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("application_emergency_no_placeholder")}
              value={emergencyNo}
              onChangeText={setEmergencyNo}
              editable={isEditable}
            />
            {errors.emergencyNo ? (
              <Text style={styles.errorText}>{errors.emergencyNo}</Text>
            ) : null}
            <Text style={styles.label}>{t("application_comment")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("application_comment_placeholder")}
              value={comment}
              onChangeText={setComment}
              editable={isEditable}
            />
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
    width: screenWidth - 300,
    alignItems: "center",
    borderRadius: 5,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#fff",
  },
});