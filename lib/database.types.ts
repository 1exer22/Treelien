export interface Database {
  public: {
    Tables: {
      users_profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          theme: string;
          custom_colors: Record<string, any>;
          custom_font: string;
          custom_background: string;
          button_style: string;
          is_premium: boolean;

          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          theme?: string;
          custom_colors?: Record<string, any>;
          custom_font?: string;
          custom_background?: string;
          button_style?: string;
          is_premium?: boolean;

          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          theme?: string;
          custom_colors?: Record<string, any>;
          custom_font?: string;
          custom_background?: string;
          button_style?: string;
          is_premium?: boolean;

          created_at?: string;
        };
      };
      links: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string;
          icon: string | null;
          position: number;
          is_active: boolean;
          click_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url: string;
          icon?: string | null;
          position?: number;
          is_active?: boolean;
          click_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string;
          icon?: string | null;
          position?: number;
          is_active?: boolean;
          click_count?: number;
          created_at?: string;
        };
      };
      clicks: {
        Row: {
          id: string;
          link_id: string;
          user_agent: string | null;
          referer: string | null;
          ip_address: string | null;
          country: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          link_id: string;
          user_agent?: string | null;
          referer?: string | null;
          ip_address?: string | null;
          country?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          link_id?: string;
          user_agent?: string | null;
          referer?: string | null;
          ip_address?: string | null;
          country?: string | null;
          created_at?: string;
        };
      };
      stripe_customers: {
        Row: {
          id: number;
          user_id: string;
          customer_id: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          customer_id: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          customer_id?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      stripe_subscriptions: {
        Row: {
          id: number;
          customer_id: string;
          subscription_id: string | null;
          price_id: string | null;
          current_period_start: number | null;
          current_period_end: number | null;
          cancel_at_period_end: boolean;
          payment_method_brand: string | null;
          payment_method_last4: string | null;
          status:
            | "not_started"
            | "incomplete"
            | "incomplete_expired"
            | "trialing"
            | "active"
            | "past_due"
            | "canceled"
            | "unpaid"
            | "paused";
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          customer_id: string;
          subscription_id?: string | null;
          price_id?: string | null;
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end?: boolean;
          payment_method_brand?: string | null;
          payment_method_last4?: string | null;
          status:
            | "not_started"
            | "incomplete"
            | "incomplete_expired"
            | "trialing"
            | "active"
            | "past_due"
            | "canceled"
            | "unpaid"
            | "paused";
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          customer_id?: string;
          subscription_id?: string | null;
          price_id?: string | null;
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end?: boolean;
          payment_method_brand?: string | null;
          payment_method_last4?: string | null;
          status?:
            | "not_started"
            | "incomplete"
            | "incomplete_expired"
            | "trialing"
            | "active"
            | "past_due"
            | "canceled"
            | "unpaid"
            | "paused";
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      stripe_orders: {
        Row: {
          id: number;
          checkout_session_id: string;
          payment_intent_id: string;
          customer_id: string;
          amount_subtotal: number;
          amount_total: number;
          currency: string;
          payment_status: string;
          status: "pending" | "completed" | "canceled";
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          checkout_session_id: string;
          payment_intent_id: string;
          customer_id: string;
          amount_subtotal: number;
          amount_total: number;
          currency: string;
          payment_status: string;
          status?: "pending" | "completed" | "canceled";
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          checkout_session_id?: string;
          payment_intent_id?: string;
          customer_id?: string;
          amount_subtotal?: number;
          amount_total?: number;
          currency?: string;
          payment_status?: string;
          status?: "pending" | "completed" | "canceled";
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
    };
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string;
          subscription_id: string | null;
          subscription_status:
            | "not_started"
            | "incomplete"
            | "incomplete_expired"
            | "trialing"
            | "active"
            | "past_due"
            | "canceled"
            | "unpaid"
            | "paused";
          price_id: string | null;
          current_period_start: number | null;
          current_period_end: number | null;
          cancel_at_period_end: boolean;
          payment_method_brand: string | null;
          payment_method_last4: string | null;
        };
      };
      stripe_user_orders: {
        Row: {
          customer_id: string;
          order_id: number;
          checkout_session_id: string;
          payment_intent_id: string;
          amount_subtotal: number;
          amount_total: number;
          currency: string;
          payment_status: string;
          order_status: "pending" | "completed" | "canceled";
          order_date: string;
        };
      };
    };
    Functions: {
      get_user_analytics: {
        Args: {
          user_uuid: string;
          days_back?: number;
        };
        Returns: {
          link_id: string;
          link_title: string;
          link_url: string;
          total_clicks: number;
          recent_clicks: number;
        }[];
      };
      check_premium_limits: {
        Args: {
          user_uuid: string;
        };
        Returns: {
          is_premium: boolean;
          current_links_count: number;
          max_links_allowed: number;
        }[];
      };
    };
  };
}
