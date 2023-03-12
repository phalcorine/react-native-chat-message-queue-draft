import { ChatMessageResource } from "./models/Resources";
import { ConnectivityManager } from "./Connectivity";
import { getRandomBoolean } from "./Randomizer";
import { AppStore } from "./Store";

export interface ChatMessageEnvelope {
    messageResource: ChatMessageResource;
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
        private readonly connectivityManager: ConnectivityManager = new ConnectivityManager(),
        private readonly appStore: AppStore = new AppStore(),
    ) {
        console.log("MessageManager has just been initialized!");
        this.init();
    }

    private init() {
        this.connectivityManager.subscribe((isConnected: boolean) => {
            if (isConnected) {
                const messagesInQueue = this.mainQueue.length;
                // console.log(`Network is back!. Total messages in queue: ${messagesInQueue}...`);
                if (messagesInQueue > 0) {
                    this.runMainQueue()
                        .then(() => console.log("Just ran the queue..."));
                }
            }
        })
    }

    async sendMessage(messageResource: ChatMessageResource) {
        const messageSent = await Promise.resolve(messageResource.processMessage);
        if (!messageSent) {
            console.log(`${this.loggerName} - Message [${messageResource.client_message_uid}] not sent!`);
            this.mainQueue.push({
                messageResource: messageResource,
                retries: 0,
            });
        } else {
            console.log(`${this.loggerName} - Message [${messageResource.client_message_uid}] sent!`);
            // update store...
            this.appStore.updateMessageById(messageResource.client_message_uid, {
                ...messageResource,
                sent: true,
            });
        }
    }

    private async runMainQueue() {
        const meow = await Promise.resolve(this.mainQueue.map(async (envelope) => {
            const messageSent = await Promise.resolve(envelope.messageResource.processMessage());
            if (!messageSent) {
                const now = new Date();
                this.failedQueue.push({
                    ...envelope,
                    retries: envelope.retries + 1,
                    last_attempt_timestamp: Math.floor(now.getTime() / 1000),
                    last_attempt_datetime: now,
                });
            } else {
                this.appStore.updateMessageById(envelope.messageResource.client_message_uid, {
                    ...envelope.messageResource,
                    sent: true,
                });
            }
        }));

        this.mainQueue = this.failedQueue;
        this.failedQueue = [];
    }
}