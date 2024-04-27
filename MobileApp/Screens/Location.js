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
  }, []);

  const declareEmergency = async () => {
    const userId = await getUserId();
    if (userId){
    setUserId(userId);
      try {
        const response = await fetch('https://piglet-vital-alien.ngrok-free.app/emergency-declare', {
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
          Alert.alert("Emergency Declared", "Your emergency has been declared!");
        } else {
          Alert.alert("Error", data.message);
        }
      } catch (error) {
        console.error("Failed to declare emergency", error);
        Alert.alert("Error", "Failed to declare emergency");
      }
    }
  };

  const sendEmergencyMessage = async (message) => {
    const userId = await getUserId();
    if (!userId) {
      Alert.alert("Error", "User not identified");
      return;
    }
  
    if (!message) {
      Alert.alert("Error", "Message is empty");
      return;
    }
  
    try {
      const response = await fetch('https://piglet-vital-alien.ngrok-free.app/emergency-message', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Your message has been added!");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("Failed to send message", error);
      Alert.alert("Error", "Failed to send message");
    }
  };

  const cancelEmergency = async (userId) => {
    try {
      const response = await fetch('https://piglet-vital-alien.ngrok-free.app/emergency-cancel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsEmergencyDeclared(false);
        Alert.alert("Emergency Cancelled", "Your emergency has been cancelled.");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("Failed to cancel emergency", error);
      Alert.alert("Error", "Failed to cancel emergency");
    }
  };
  

  const handleEmergencyToggle = () => {
    if (isEmergencyDeclared) {
      // Ask user if they really want to cancel the emergency
      Alert.alert(
        "Cancel Emergency",
        "Are you sure you want to cancel the emergency?",
        [
          {
            text: "No",
            onPress: () => console.log("Cancel Cancelled"),
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => {
              cancelEmergency(userId),
              setIsEmergencyDeclared(false);
            },
          },
        ]
      );
    } else {
      declareEmergency();
      // Alert.alert("Emergency Declared", "Your emergency has been declared!", [
      //   { text: "OK" },
      // ]);
      setIsEmergencyDeclared(true);
    }
  };

  //   const handleEmergencyCall = () => {
  //     const url = `tel:${emergencyNo}`;
  //     Linking.canOpenURL(url)
  //       .then((supported) => {
  //         if (!supported) {
  //           Alert.alert("Phone call not supported");
  //         } else {
  //           return Linking.openURL(url);
  //         }
  //       })
  //       .catch((err) => console.error('An error occurred', err));
  //   };

  const handleEmergencyMessage = () => {
    Alert.prompt(
      "Emergency Message",
      "Describe your emergency",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: sendEmergencyMessage,
        },
      ],
      "plain-text"
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Your Current Location</Text>
      <MapView style={styles.map} region={mapRegion}>
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={"You are here"}
          />
        )}
      </MapView>
      {errorMsg && <Text>{errorMsg}</Text>}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleEmergencyToggle}
      >
        <Text style={styles.actionButtonText}>
          {isEmergencyDeclared ? "Cancel Emergency" : "Declare Emergency"}
        </Text>
      </TouchableOpacity>
      {isEmergencyDeclared && (
        <View style={styles.emergencyOptions}>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionButtonText}>Emergency Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleEmergencyMessage}
          >
            <Text style={styles.optionButtonText}>Emergency Message</Text>
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
