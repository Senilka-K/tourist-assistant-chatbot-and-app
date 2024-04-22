import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from "../myproject/Screens/HomeScreen";
import Location from "../myproject/Screens/Location";
import ChatBot from "../myproject/Screens/ChatBot";
import Ionicons from "@expo/vector-icons/Ionicons"


const Tab = createBottomTabNavigator()

export default function App () {
  return(
    <NavigationContainer>
      <Tab.Navigator screenOptions={{
        tabBarLabelPosition: "below-icon",
        tabBarShowLabel: true,
        tabBarActiveTintColor: "purple",
      }}>
        <Tab.Screen name='Home' component={HomeScreen} options={{
          tabBarLabel: "Home Page",
          tabBarIcon: ( {color} ) => <Ionicons name='home' size={20} color={color} />
        }}/>
        <Tab.Screen name='Location' component={Location}  options={{
          tabBarLabel: "Your Location",
          tabBarIcon: ( {color} ) => <Ionicons name='location' size={20} color={color} />
        }}/>
        <Tab.Screen name='ChatBot' component={ChatBot}  options={{
          tabBarLabel: "Chat",
          tabBarIcon: ( {color} ) => <Ionicons name='chatbubbles' size={20} color={color} />
        }}/>
      </Tab.Navigator>
    </NavigationContainer>
  )
}

