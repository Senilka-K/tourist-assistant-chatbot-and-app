// import React, { useState, useCallback, useEffect } from 'react';
// import { GiftedChat } from 'react-native-gifted-chat';
// import { View, Platform, KeyboardAvoidingView } from 'react-native';

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     setMessages([
//       {
//         _id: 1,
//         text: 'Hello developer',
//         createdAt: new Date(),
//         user: {
//           _id: 2,
//           name: 'React Native',
//           avatar: 'https://placeimg.com/140/140/any',
//         },
//       },
//     ])
//   }, [])

//   const onSend = useCallback((messages = []) => {
//     setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
//     // Auto-reply with the same initial message
//     setTimeout(() => {
//       const botMessage = {
//         _id: Math.random() * 1000000,  // Use random ID for key extraction
//         text: 'Hello developer',  // Same message as the initial one
//         createdAt: new Date(),
//         user: {
//           _id: 2,
//           name: 'React Native',
//           avatar: 'https://placeimg.com/140/140/any',
//         },
//       };
//       setMessages(previousMessages => GiftedChat.append(previousMessages, [botMessage]));
//     }, 500);  // Short delay to mimic real-time response
//   }, [])

//   return (
//     <View style={{ flex: 1 }}>
//       <GiftedChat
//         messages={messages}
//         onSend={messages => onSend(messages)}
//         user={{
//           _id: 1,  // Assuming '1' is the ID for the user
//         }}
//       />
//       {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="padding" /> : null}
//     </View>
//   );
// };

// export default ChatBot;

import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { NGROK_STATIC_DOMAIN } from '@env';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello! Welcome! How are you?',
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

