import React from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
} from 'react-native';

type ItemProps = {content: string, sent: boolean};

export const ChatMessageItem = ({content, sent}: ItemProps) => (
    <View style={styles.item}>
        <Text style={styles.content}>{content}</Text>
        <Text style={styles.sent}>Message Sent: {sent ? "Yes" : "No"}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: StatusBar.currentHeight || 0,
    },
    item: {
      backgroundColor: '#f9c2ff',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    content: {
        fontSize: 24,
    },
    sent: {
        fontSize: 10,
    },
});