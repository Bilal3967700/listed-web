export interface InboxConversation {
  id: string;
  listingId: string | null;
  listingTitle: string;
  listingPriceLkr: number;
  listingImageUrl: string | null;
  otherUserId: string;
  otherUserName: string;
  otherUsername: string;
  otherAvatarUrl: string | null;
  lastMessageBody: string | null;
  lastMessageSenderId: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface ConversationDetails {
  id: string;
  listingId: string | null;
  listingTitle: string;
  listingPriceLkr: number;
  listingImageUrl: string | null;
  buyerId: string;
  sellerId: string;
  otherUserId: string;
  otherUserName: string;
  otherUsername: string;
  otherAvatarUrl: string | null;
}