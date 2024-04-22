import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../tourist-assistant-chatbot-and-app/Screens/HomeScreen";
import Location from "../tourist-assistant-chatbot-and-app/Screens/Location";
import ChatBot from "../tourist-assistant-chatbot-and-app/Screens/ChatBot";
import ApplicationForm from "./Screens/ApplicationForm";
import LanguageSelectionScreen from "./Screens/LanguageSelectionScreen";
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
            name="Location"
            component={ApplicationForm}
            options={{
              tabBarLabel: "Your Location",
              tabBarIcon: ({ color }) => (
                <Ionicons name="location" size={20} color={color} />
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
