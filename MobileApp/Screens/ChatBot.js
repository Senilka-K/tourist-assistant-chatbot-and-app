import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { NGROK_STATIC_DOMAIN } from '@env';
import { useLanguage } from '../LanguageContext';
import i18n from '../I18n';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const { language, switchLanguage } = useLanguage();
  const languageStatusRef = useRef(false);

  const toggleLanguage = () => {
    languageStatusRef.current = !languageStatusRef.current;
  }
  
  const handleLanguageChange = async () => {

    if (!languageStatusRef.current) {
      try {
        const response = await fetch(`${NGROK_STATIC_DOMAIN}/language`);
        if (!response.ok) {
          throw new Error('Error fetching language');
        }
        const data = await response.json();
        console.log("Changing language to:", data);
        toggleLanguage();
        switchLanguage(data);
        i18n.changeLanguage(data);
      }
      catch (error) {
        console.error('Failed to fetch language:', error);
      }
    }
  };

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Welcome! How are you? How can I help you? \n\n Accueillir! Comment vas-tu? Comment puis-je t'aider? \n\n ¡Bienvenido! ¿Cómo estás? ¿Le puedo ayudar en algo? \n\n Willkommen! Wie geht es dir? Wie kann ich dir helfen? \n\n Benvenuto! Come stai? Come posso aiutarla?",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ]);
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
    const lastMessage = messages[0].text;

    fetch(`${NGROK_STATIC_DOMAIN}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: lastMessage })
    })
    .then(response => response.json())
    .then(data => {
      setMessages(previousMessages => GiftedChat.append(previousMessages, [{
        _id: Math.random() * 1000000,
        text: data.text,
        createdAt: new Date(),
        user: data.user
      }]));
      return handleLanguageChange();
    })
    .catch(error => console.error('Error sending message:', error));
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1, // Assuming '1' is the ID for the user
        }}
      />
      {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="padding" /> : null}
    </View>
  );
};

export default ChatBot;

