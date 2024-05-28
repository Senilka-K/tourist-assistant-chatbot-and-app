import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useIsFocused } from "@react-navigation/native";

import { NGROK_STATIC_DOMAIN } from '@env';

const Police = () => {
  const [locations, setLocations] = useState([]);

  const fetchEmergencies = async () => {
    try {
      const response = await fetch(`${NGROK_STATIC_DOMAIN}/emergency-ongoing`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setLocations(data.map(item => ({
        user: `User ${item.username}`, 
        latitude: item.location.latitude,
        longitude: item.location.longitude,
        dateTimeDeclared: item.dateTimeDeclared, 
        message: item.message.join(" "),
      })));
    } catch (error) {
      console.error('Failed to fetch emergencies:', error);
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 5000); // fetch every 5 seconds

    return () => clearInterval(interval);
  }, [isFocused]);

  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const focusOnLocation = (latitude, longitude) => {
    setRegion({
      ...region,
      latitude: latitude,
      longitude: longitude,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => focusOnLocation(item.latitude, item.longitude)}>
      <Text style={styles.title}>{`Emergency Declared by ${item.user}`}</Text>
      <Text style={styles.itemText}>{`Latitude: ${item.latitude}`}</Text>
      <Text style={styles.itemText}>{`Longitude: ${item.longitude}`}</Text>
      <Text style={styles.itemText}>{`Declared: ${new Date(item.dateTimeDeclared).toLocaleString()}`}</Text>
      <Text style={styles.itemText}>{`Message: ${item.message}`}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Emergency Locations</Text>
      <MapView style={styles.map} region={region}>
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={`Emergency at Location ${loc.id}`}
            description={loc.description}
          />
        ))}
      </MapView>
      <FlatList
        data={locations}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 20,
    marginBottom: 16,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height / 2,
  },
  item: {
    backgroundColor: 'red',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
  },
  itemText: {
    paddingTop: 10,
    color: "white",
    fontSize: 18,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: "center",
  },
});

export default Police;