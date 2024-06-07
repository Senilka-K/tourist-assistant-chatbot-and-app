import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { NGROK_STATIC_DOMAIN } from '@env';
import { useLanguage } from '../LanguageContext';
import i18n from '../I18n';

const initialMessages = [
  {
    _id: 1,
    text: "Welcome! How are you? How can I help you? \n\n Accueillir! Comment vas-tu? Comment puis-je t'aider? \n\n ¡Bienvenido! ¿Cómo estás? ¿Le puedo ayudar en algo? \n\n Willkommen! Wie geht es dir? Wie kann ich dir helfen? \n\n Benvenuto! Come stai? Come posso aiutarla?",
    createdAt: new Date(),
    user: {
      _id: 2,

      name: 'React Native',
      avatar: 'https://placeimg.com/140/140/any',
    },
  }
];

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const { language, switchLanguage } = useLanguage();
  const languageStatusRef = useRef(false);
 
  const toggleLanguage = () => {
    languageStatusRef.current = !languageStatusRef.current;
  }

  const saveMessages = async () => {
    try {
      const response = await fetch(`${NGROK_STATIC_DOMAIN}/save-messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error in saving messages:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`${NGROK_STATIC_DOMAIN}/load-messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      const initialMessageTime = new Date(initialMessages[0].createdAt).getTime();
      const transformedMessages = data.map((item, index) => ({
        _id: Math.random() * 1000000,
        text: item.text,
        createdAt: new Date(initialMessageTime + (index + 1) * 60),
        user: {
          _id: index % 2 === 0 ? 1 : 2,
          name: index % 2 === 0 ? 'User' : 'Assistant',
          avatar: 'https://placeimg.com/140/140/any',
        }
      }));
      const allMessages = [...initialMessages, ...transformedMessages];
      allMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMessages(allMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };
  
  const handleLanguageChange = async () => {

    if (!languageStatusRef.current) {
      try {
        await saveMessages();
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

  const updateLanguageAndLoadMessages = async () => {
    try {
      const response = await fetch(`${NGROK_STATIC_DOMAIN}/language`);
      if (response.ok) {
        console.log("messages should load now");
        loadMessages();
      }
      else{
        console.log("messages should not be loaded");
      }
    }
    catch (error) {
      console.error("Error restoring message history");
    }
  };

  useEffect(() => {
    updateLanguageAndLoadMessages();
  }, []);
  
  useEffect(() => {
    setMessages([...initialMessages]);
  }, [language]); 

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
  }, [setMessages]);

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1,
        }}
      />
      {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="padding" /> : null}
    </View>
  );
};

export default ChatBot;