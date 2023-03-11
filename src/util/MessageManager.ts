import { ChatMessageResource } from "../models/Resources";
import { ConnectivityManager } from "./Connectivity";
import { getRandomBoolean } from "./Randomizer";
import { AppStore } from "./Store";

export interface ChatMessageEnvelope {
    message: ChatMessageResource;
    retries: number;
    last_attempt_timestamp?: number;
    last_attempt_datetime?: Date;
}

export class MessageManager {
    private loggerName = "[MessageManager]";

    private retryTimeout = 5000;
    private retryAdditional = 5;

    private mainQueue: ChatMessageEnvelope[] = [];
    private failedQueue: ChatMessageEnvelope[] = [];

    constructor(
        private readonly connectivityManager: ConnectivityManager,
        private readonly appStore: AppStore,
    ) {
        console.log("MessageManager has just been initialized!");
        this.init();
    }

    private init() {
        this.connectivityManager.subscribe((payload: boolean) => {
            // console.log("Payload for Event: ", payload);
            if (payload) {
                const messagesInQueue = this.mainQueue.length;
                console.log(`Network is back!. Total messages in queue: ${messagesInQueue}...`);
                if (messagesInQueue > 0) {
                    this.runMainQueue()
                        .then(() => console.log("Just ran the queue..."));
                }
            }
        })
    }

    async sendMessage(message: ChatMessageResource) {
        // Fake sending of message to API...
        const messageSent = getRandomBoolean();
        if (!messageSent) {
            console.log(`${this.loggerName} - Message [${message.content}] not sent!`);
            this.mainQueue.push({
                message,
                retries: 0,
            });
        } else {
            console.log(`${this.loggerName} - Message [${message.content}] sent!`);
            // update store...
            this.appStore.updateMessageById(message.client_message_uid, {
                ...message,
                sent: true,
            });
        }
    }

    private async runMainQueue() {
        const meow = await Promise.resolve(this.mainQueue.map(async (envelope) => {
            // Fake sending of message to API...
            const messageSent = getRandomBoolean();
            if (!messageSent) {
                const now = new Date();
                this.failedQueue.push({
                    ...envelope,
                    retries: envelope.retries + 1,
                    last_attempt_timestamp: Math.floor(now.getTime() / 1000),
                    last_attempt_datetime: now,
                });
            } else {
                // update store...
                this.appStore.updateMessageById(envelope.message.client_message_uid, {
                    ...envelope.message,
                    sent: true,
                });
            }
        }));

        this.mainQueue = this.failedQueue;
        this.failedQueue = [];
    }
}