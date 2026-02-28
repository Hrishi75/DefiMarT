// Database types for Supabase
// These map to the SQL schema and are used by the Supabase client for type safety

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          username: string;
          display_name: string;
          bio: string | null;
          avatar_url: string | null;
          cover_image_url: string | null;
          verified: boolean;
          events_attended: string[];
          social_links: Json;
          items_owned: number;
          items_sold: number;
          total_sales: number;
          reputation: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          username: string;
          display_name: string;
          bio?: string | null;
          avatar_url?: string | null;
          cover_image_url?: string | null;
          verified?: boolean;
          events_attended?: string[];
          social_links?: Json;
          items_owned?: number;
          items_sold?: number;
          total_sales?: number;
          reputation?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          username?: string;
          display_name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          cover_image_url?: string | null;
          verified?: boolean;
          events_attended?: string[];
          social_links?: Json;
          items_owned?: number;
          items_sold?: number;
          total_sales?: number;
          reputation?: number;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          cover_image_url: string | null;
          logo_url: string | null;
          location: string;
          date: string;
          end_date: string | null;
          organizer: string;
          organizer_id: string | null;
          verified: boolean;
          total_items: number;
          total_collectors: number;
          tags: string[];
          website: string | null;
          on_chain_contract_address: string | null;
          on_chain_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          cover_image_url?: string | null;
          logo_url?: string | null;
          location: string;
          date: string;
          end_date?: string | null;
          organizer: string;
          organizer_id?: string | null;
          verified?: boolean;
          total_items?: number;
          total_collectors?: number;
          tags?: string[];
          website?: string | null;
          on_chain_contract_address?: string | null;
          on_chain_verified?: boolean;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          description?: string | null;
          cover_image_url?: string | null;
          logo_url?: string | null;
          location?: string;
          date?: string;
          end_date?: string | null;
          organizer?: string;
          organizer_id?: string | null;
          verified?: boolean;
          total_items?: number;
          total_collectors?: number;
          tags?: string[];
          website?: string | null;
          on_chain_contract_address?: string | null;
          on_chain_verified?: boolean;
        };
      };
      listings: {
        Row: {
          id: string;
          seller_id: string;
          event_id: string | null;
          title: string;
          description: string | null;
          images: string[];
          category: string;
          condition: string;
          price: number;
          currency: string;
          status: string;
          quantity: number;
          quantity_available: number;
          is_nft: boolean;
          nft_metadata: Json | null;
          shipping_info: Json | null;
          views: number;
          favorites: number;
          tags: string[];
          escrow_address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          event_id?: string | null;
          title: string;
          description?: string | null;
          images?: string[];
          category: string;
          condition: string;
          price: number;
          currency?: string;
          status?: string;
          quantity?: number;
          quantity_available?: number;
          is_nft?: boolean;
          nft_metadata?: Json | null;
          shipping_info?: Json | null;
          views?: number;
          favorites?: number;
          tags?: string[];
          escrow_address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          seller_id?: string;
          event_id?: string | null;
          title?: string;
          description?: string | null;
          images?: string[];
          category?: string;
          condition?: string;
          price?: number;
          currency?: string;
          status?: string;
          quantity?: number;
          quantity_available?: number;
          is_nft?: boolean;
          nft_metadata?: Json | null;
          shipping_info?: Json | null;
          views?: number;
          favorites?: number;
          tags?: string[];
          escrow_address?: string | null;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
          currency: string;
          status: string;
          transaction_hash: string | null;
          escrow_address: string | null;
          shipping_tracking: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          amount: number;
          currency?: string;
          status?: string;
          transaction_hash?: string | null;
          escrow_address?: string | null;
          shipping_tracking?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: string;
          transaction_hash?: string | null;
          escrow_address?: string | null;
          shipping_tracking?: string | null;
          completed_at?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          images: string[];
          linked_listing_id: string | null;
          event_id: string | null;
          likes_count: number;
          comments_count: number;
          shares_count: number;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          images?: string[];
          linked_listing_id?: string | null;
          event_id?: string | null;
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          content?: string;
          images?: string[];
          linked_listing_id?: string | null;
          event_id?: string | null;
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          tags?: string[];
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_comment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_comment_id?: string | null;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          listing_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          listing_id?: string | null;
          created_at?: string;
        };
        Update: never;
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message?: string | null;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
      auth_nonces: {
        Row: {
          id: string;
          wallet_address: string;
          nonce: string;
          expires_at: string;
          used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          nonce: string;
          expires_at: string;
          used?: boolean;
          created_at?: string;
        };
        Update: {
          used?: boolean;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: never;
      };
      conversations: {
        Row: {
          id: string;
          participant_1: string;
          participant_2: string;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_1: string;
          participant_2: string;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          last_message_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
      reviews: {
        Row: {
          id: string;
          reviewer_id: string;
          reviewed_id: string;
          listing_id: string;
          transaction_id: string;
          rating: number;
          content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reviewer_id: string;
          reviewed_id: string;
          listing_id: string;
          transaction_id: string;
          rating: number;
          content?: string | null;
          created_at?: string;
        };
        Update: {
          rating?: number;
          content?: string | null;
        };
      };
    };
  };
}
