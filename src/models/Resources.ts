export interface UserResource {
    uid: string;
    full_name: string;
}

export interface ChatMessageResource {
    processMessage(): Promise<boolean>;
    client_message_uid: string;
    sent: boolean;
}