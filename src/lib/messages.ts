import { createClient } from "@/lib/supabase/server";

import {
  ConversationDetails,
  ConversationMessage,
  InboxConversation
} from "@/types/messaging";

type InboxRow = {
  conversation_id: string;
  listing_id: string | null;
  listing_title: string;
  listing_price_lkr: number;
  listing_image_url: string | null;
  other_user_id: string;
  other_user_name: string;
  other_username: string;
  other_avatar_url: string | null;
  last_message_body: string | null;
  last_message_sender_id: string | null;
  last_message_at: string;
  unread_count: number;
};

type ConversationRow = {
  id: string;
  listing_id: string | null;
  listing_title: string;
  listing_price_lkr: number;
  listing_image_url: string | null;
  buyer_id: string;
  seller_id: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export async function getInboxConversations(): Promise<
  InboxConversation[]
> {
  const supabase = await createClient();

  const { data, error } =
    await supabase.rpc(
      "get_inbox_conversations"
    );

  if (error) {
    console.error(
      "getInboxConversations error:",
      error.message
    );

    return [];
  }

  return ((data || []) as InboxRow[]).map(
    (row) => ({
      id: row.conversation_id,
      listingId: row.listing_id,
      listingTitle:
        row.listing_title,
      listingPriceLkr:
        row.listing_price_lkr,
      listingImageUrl:
        row.listing_image_url,
      otherUserId:
        row.other_user_id,
      otherUserName:
        row.other_user_name,
      otherUsername:
        row.other_username,
      otherAvatarUrl:
        row.other_avatar_url,
      lastMessageBody:
        row.last_message_body,
      lastMessageSenderId:
        row.last_message_sender_id,
      lastMessageAt:
        row.last_message_at,
      unreadCount: Number(
        row.unread_count || 0
      )
    })
  );
}

export async function getConversation(
  conversationId: string,
  currentUserId: string
): Promise<{
  conversation: ConversationDetails;
  messages: ConversationMessage[];
} | null> {
  const supabase = await createClient();

  const {
    data: conversation,
    error: conversationError
  } = await supabase
    .from("conversations")
    .select(`
      id,
      listing_id,
      listing_title,
      listing_price_lkr,
      listing_image_url,
      buyer_id,
      seller_id
    `)
    .eq("id", conversationId)
    .single();

  if (
    conversationError ||
    !conversation
  ) {
    console.error(
      "getConversation error:",
      conversationError?.message
    );

    return null;
  }

  const row =
    conversation as ConversationRow;

  const otherUserId =
    row.buyer_id === currentUserId
      ? row.seller_id
      : row.buyer_id;

  const {
    data: otherProfile,
    error: profileError
  } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      username,
      avatar_url
    `)
    .eq("id", otherUserId)
    .single();

  if (
    profileError ||
    !otherProfile
  ) {
    console.error(
      "getConversation profile error:",
      profileError?.message
    );

    return null;
  }

  const {
    data: messageRows,
    error: messagesError
  } = await supabase
    .from("messages")
    .select(`
      id,
      conversation_id,
      sender_id,
      body,
      read_at,
      created_at
    `)
    .eq(
      "conversation_id",
      conversationId
    )
    .order("created_at", {
      ascending: true
    });

  if (messagesError) {
    console.error(
      "getConversation messages error:",
      messagesError.message
    );

    return null;
  }

  return {
    conversation: {
      id: row.id,
      listingId: row.listing_id,
      listingTitle:
        row.listing_title,
      listingPriceLkr:
        row.listing_price_lkr,
      listingImageUrl:
        row.listing_image_url,
      buyerId: row.buyer_id,
      sellerId: row.seller_id,
      otherUserId,
      otherUserName:
        otherProfile.full_name ||
        otherProfile.username ||
        "Listed user",
      otherUsername:
        otherProfile.username ||
        "user",
      otherAvatarUrl:
        otherProfile.avatar_url
    },

    messages: (
      (messageRows || []) as MessageRow[]
    ).map((message) => ({
      id: message.id,
      conversationId:
        message.conversation_id,
      senderId:
        message.sender_id,
      body: message.body,
      readAt: message.read_at,
      createdAt:
        message.created_at
    }))
  };
}