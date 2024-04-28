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
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Tab = createBottomTabNavigator();

export default function App() {
  const { t } = useTranslation();

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
            name={t("home")}
            component={HomeScreen}
            options={{
              tabBarLabel: t("home"),
              tabBarIcon: ({ color }) => (
                <Ionicons name="home" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name={t("application")}
            component={ApplicationForm}
            options={{
              tabBarLabel: t("application"),
              tabBarIcon: ({ color }) => (
                <Ionicons name="apps-outline" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name={t("emergency")}
            component={MapScreen}
            options={{
              tabBarLabel: t("emergency"),
              tabBarIcon: ({ color }) => (
                <Ionicons name="location" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name={t("police")}
            component={Police}
            options={{
              tabBarLabel: t("police"),
              tabBarIcon: ({ color }) => (
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={color}
                />
              ),
            }}
          />
          <Tab.Screen
            name={t("chat")}
            component={ChatBot}
            options={{
              tabBarLabel: t("chat"),
              tabBarIcon: ({ color }) => (
                <Ionicons name="chatbubbles" size={20} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name={t("settings")}
            component={LanguageSelectionScreen}
            options={{
              tabBarLabel: t("settings"),
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
