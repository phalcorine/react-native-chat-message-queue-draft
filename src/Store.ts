import { DeviceEventEmitter } from "react-native";
import { ChatMessageResource } from "./models/Resources";

const EVENT_STORE_DATA_CHANGED = 'event-store-data-changed';

export class AppStore {
    messages: ChatMessageResource[] = [];

    constructor() {
        console.log("AppStore has just been initialized!");
    }

    updateMessageById(messageUid: string, updatedMessage: ChatMessageResource) {
        let dataChanged = false;
        this.messages = this.messages.map(message => {
            if (message.client_message_uid == messageUid) {
                console.log(`Found message by ID: ${messageUid}`);
                dataChanged = true;
                return updatedMessage;
            } else {
                return message;
            }
        });

        if (dataChanged) {
            this.triggerChange();
        }
    }

    addMessage(message: ChatMessageResource) {
        this.messages.push(message);
        this.triggerChange();
    }

    private triggerChange() {
        console.log("Store data just changed!");
        DeviceEventEmitter.emit(EVENT_STORE_DATA_CHANGED);
    }

    subscribe(subscriber: () => void) {
        DeviceEventEmitter.addListener(EVENT_STORE_DATA_CHANGED, subscriber);
    }
}