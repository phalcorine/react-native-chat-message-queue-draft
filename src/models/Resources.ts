export interface UserResource {
    uid: string;
    full_name: string;
}

export interface ChatMessageResource {
    client_message_uid: string;
    recipient_uid: string;
    sender_uid: string;
    content: string;
    sent: boolean;
}