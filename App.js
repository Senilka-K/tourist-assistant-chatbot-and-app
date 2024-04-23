import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./Screens/HomeScreen";
import MapScreen from "./Screens/Location";
import ChatBot from "./Screens/ChatBot";
import ApplicationForm from "./Screens/ApplicationForm";
import LanguageSelectionScreen from "./Screens/LanguageSelectionScreen";
import Police from "./Screens/Police";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LanguageProvider } from "./LanguageContext";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarLabelPosition: "below-icon",
            tabBarShowLabel: true,
            tabBarActiveTintColor: "purple",
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: "Home Page",
              tabBarIcon: ({ color }) => (
                <Ionicons name="home" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Application"
            component={ApplicationForm}
            options={{
              tabBarLabel: "Application",
              tabBarIcon: ({ color }) => (
                <Ionicons name="apps-outline" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Location"
            component={MapScreen}
            options={{
              tabBarLabel: "Your Location",
              tabBarIcon: ({ color }) => (
                <Ionicons name="location" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Police"
            component={Police}
            options={{
              tabBarLabel: "Police",
              tabBarIcon: ({ color }) => (
                <Ionicons name="shield-checkmark-outline" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="ChatBot"
            component={ChatBot}
            options={{
              tabBarLabel: "Chat",
              tabBarIcon: ({ color }) => (
                <Ionicons name="chatbubbles" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={LanguageSelectionScreen}
            options={{
              tabBarLabel: "Settings",
              tabBarIcon: ({ color }) => (
                <Ionicons name="settings" size={20} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}
