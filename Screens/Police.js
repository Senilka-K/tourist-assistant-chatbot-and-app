import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const Police = () => {
  const [locations, setLocations] = useState([
    {
      id: 1,
      user: 'User A',
      latitude: 37.78825,
      longitude: -122.4324,
      description: 'Emergency 1',
      message: 'There has been a robbery here.'
    },
    {
      id: 2,
      user: 'User B',
      latitude: 37.78925,
      longitude: 102.4314,
      description: 'Emergency 2',
      message: 'Accident on the corner, needs immediate attention.'
    },
    {
        id: 3,
        user: 'User C',
        latitude: 7.8731,
        longitude: 80.7718,
        description: 'Emergency 3',
        message: 'There is a bomb.'
    },
    {
        id: 4,
        user: 'User D',
        latitude: -25.2744,
        longitude: 133.7751,
        description: 'Emergency 4',
        message: 'There has been a earthquake.'
    }
  ]);

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
      <Text style={styles.title}>{`Emergency declared by ${item.user}`}</Text>
      <Text>{`Location: ${item.description}`}</Text>
      <Text>{`Message: ${item.message}`}</Text>
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
        keyExtractor={item => item.id.toString()}
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
    backgroundColor: '#FEDFC2',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Police;
