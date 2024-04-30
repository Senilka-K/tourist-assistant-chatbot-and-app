import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { getUserId } from "../UserIdStore";
import { useIsFocused } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { NGROK_STATIC_DOMAIN } from '@env';

const MapScreen = ({ route }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [userId, setUserId] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [isEmergencyDeclared, setIsEmergencyDeclared] = useState(false);
  const [emergencyNumber, setEmergencyNumber] = useState('');
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, [isFocused]);

  const declareEmergency = async () => {
    const userId = await getUserId();
    if (userId){
    setUserId(userId);
      try {
        const response = await fetch(`${NGROK_STATIC_DOMAIN}/emergency-declare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            onGoingEmergency: true,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsEmergencyDeclared(true);
          Alert.alert(t("emergency_declared_alert"), t("emergency_declared_alert_message"));
        } else {
          Alert.alert(t("error_alert"), data.message);
        }
      } catch (error) {
        console.error("Failed to declare emergency", error);
        Alert.alert(t("error_alert"), t("emergency_declared_alert_error_message"));
      }
    }
  };

  const sendEmergencyMessage = async (message) => {
    const userId = await getUserId();
    if (!userId) {
      Alert.alert(t("error_alert"), t("user_not_difined"));
      return;
    }
  
    if (!message) {
      Alert.alert(t("error_alert"), t("emergency_message_alert"));
      return;
    }
  
    try {
      const response = await fetch(`${NGROK_STATIC_DOMAIN}/emergency-message`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert(t("success_alert"), t("emergency_message_alert_success_message"));
      } else {
        Alert.alert(t("error_alert"), data.message);
      }
    } catch (error) {
      console.error("Failed to send message", error);
      Alert.alert(t("error_alert"), t("emergency_message_alert_error_message"));
    }
  };

  const handleEmergencyCall = async () => {
    try {
      const userId = await getUserId(); // Assuming getUserId() correctly retrieves the current user's ID
      if (!userId) {
        Alert.alert(t("error_alert"), t("userId_error_message"));
        return;
      }
      
      const response = await fetch(`${NGROK_STATIC_DOMAIN}/emergency-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.ok) {
        const emergencyNo = data.emergencyNo;
        Linking.openURL(`tel:${emergencyNo}`)
          .catch(err => console.error('An error occurred trying to launch phone dialer', err));
      } else {
        Alert.alert(t("error_alert"), t("no_emergency_number_available"));
      }
    } catch (error) {
      console.error("Failed to fetch emergency number", error);
      Alert.alert(t("error_alert"), t("network_error"));
    }
  };
  

  const cancelEmergency = async (userId) => {
    try {
      const response = await fetch(`${NGROK_STATIC_DOMAIN}/emergency-cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsEmergencyDeclared(false);
        Alert.alert(t("emergency_cancel_alert"), t("emergency_cancel_alert_message"));
      } else {
        Alert.alert(t("error_alert"), data.message);
      }
    } catch (error) {
      console.error("Failed to cancel emergency", error);
      Alert.alert(t("error_alert"), t("emergency_cancel_alert_error_message"));
    }
  };
  
  const handleEmergencyToggle = () => {
    if (isEmergencyDeclared) {
      Alert.alert(
        t("cancel_emergency_alert"),
        t("cancel_emergency_alert_message"),
        [
          {
            text: t("no"),
            onPress: () => console.log("Cancel Cancelled"),
            style: "cancel",
          },
          {
            text: t("yes"),
            onPress: () => {
              cancelEmergency(userId),
              setIsEmergencyDeclared(false);
            },
          },
        ]
      );
    } else {
      declareEmergency();
      setIsEmergencyDeclared(true);
    }
  };

  const handleEmergencyMessage = () => {
    Alert.prompt(
      t("message_alert"),
      t("message_alert_message"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("send"),
          onPress: sendEmergencyMessage,
        },
      ],
      "plain-text"
    );
  };

  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t("location_page")}</Text>
      <MapView style={styles.map} region={mapRegion}>
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={t("location_title")}
          />
        )}
      </MapView>
      {errorMsg && <Text>{errorMsg}</Text>}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleEmergencyToggle}
      >
        <Text style={styles.actionButtonText}>
          {isEmergencyDeclared ? t("cancel_emergency") : t("declare_emergency")}
        </Text>
      </TouchableOpacity>
      {isEmergencyDeclared && (
        <View style={styles.emergencyOptions}>
          <TouchableOpacity style={styles.optionButton} onPress={handleEmergencyCall}>
            <Text style={styles.optionButtonText}>{t("emergency_call")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleEmergencyMessage}
          >
            <Text style={styles.optionButtonText}>{t("emergency_message")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    paddingTop: 10,
    marginBottom: 16,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 2,
  },
  actionButton: {
    backgroundColor: "red",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  actionButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  emergencyOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 20,
  },
  optionButton: {
    backgroundColor: "blue",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    width: "40%",
    alignItems: "center",
  },
  optionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default MapScreen;
