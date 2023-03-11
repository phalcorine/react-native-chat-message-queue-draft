import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { ChatMessageItem } from './src/components/ChatMessageItem';
import { ChatMessageResource } from './src/models/Resources';
import { ConnectivityManager } from './src/util/Connectivity';
import { MessageManager } from './src/util/MessageManager';
import { AppStore } from './src/util/Store';

const connectivityManager = new ConnectivityManager();
const appStore = new AppStore();
const messageManager = new MessageManager(connectivityManager, appStore);

export default function App() {
  const loggerName = "[AppScreen]";

  const [messages, setMessages] = useState<ChatMessageResource[]>([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    console.log(`${loggerName} - This should only run once...`);
  
    setMessages(appStore.messages);

    // Simulate store updates
    appStore.subscribe(() => {
      setMessages(appStore.messages);
    });
    // setInterval(() => {
    //   // console.log("Messages in the store...");
    //   // console.log(appStore.messages);
    //   setMessages(appStore.messages);
    // }, 1000);
  }, []);

  const handleSendMessage = async () => {
    const chatMessage: ChatMessageResource = {
      client_message_uid: `MSG_${Date.now().toString()}`,
      recipient_uid: "a1000",
      sender_uid: "b2000",
      content: message,
      sent: false,
    };

    appStore.addMessage(chatMessage);
    await messageManager.sendMessage(chatMessage);

    setMessage("");
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <FlatList 
        data={messages}
        renderItem={({item}) => <ChatMessageItem content={item.content} sent={item.sent} />}
        keyExtractor={item => item.client_message_uid}
        />
      <TextInput onChangeText={setMessage} value={message} placeholder="Meow here?" />
      <Button onPress={handleSendMessage} title="Send Message" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
