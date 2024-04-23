import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Alert, Linking } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const MapScreen = ({ route }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);
//   const { emergencyNo } = route.params; // assuming emergencyNo is passed via navigation params

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

  const handleEmergency = () => {
    Alert.alert("Emergency Declared", "Your emergency has been declared!", [{ text: "OK" }]);
    setShowEmergencyOptions(true);
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
          onPress: message => console.log('Emergency message:', message)
        }
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
      <TouchableOpacity style={styles.actionButton} onPress={handleEmergency}>
        <Text style={styles.actionButtonText}>Declare Emergency</Text>
      </TouchableOpacity>
      {showEmergencyOptions && (
        <View style={styles.emergencyOptions}>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionButtonText}>Emergency Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={handleEmergencyMessage}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
  },
  optionButton: {
    backgroundColor: "blue",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  optionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: 'center',
  },
});

export default MapScreen;
