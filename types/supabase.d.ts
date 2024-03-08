export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      wedding_guest_groups: {
        Row: {
          id: string;
          name: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
        };
        Relationships: [];
      };
      wedding_guest_tokens: {
        Row: {
          created_at: string;
          guest_id: string;
          id: string;
          token_id: string;
        };
        Insert: {
          created_at?: string;
          guest_id: string;
          id?: string;
          token_id: string;
        };
        Update: {
          created_at?: string;
          guest_id?: string;
          id?: string;
          token_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'public_wedding_guest_tokens_guest_id_fkey';
            columns: ['guest_id'];
            isOneToOne: false;
            referencedRelation: 'wedding_guests';
            referencedColumns: ['id'];
          },
        ];
      };
      wedding_guests: {
        Row: {
          email: string | null;
          guest_group_id: string | null;
          id: string;
          is_admin: boolean;
          is_deleted: boolean;
          is_subscribed: boolean;
          name: string;
        };
        Insert: {
          email?: string | null;
          guest_group_id?: string | null;
          id?: string;
          is_admin?: boolean;
          is_deleted?: boolean;
          is_subscribed?: boolean;
          name: string;
        };
        Update: {
          email?: string | null;
          guest_group_id?: string | null;
          id?: string;
          is_admin?: boolean;
          is_deleted?: boolean;
          is_subscribed?: boolean;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'public_wedding_guests_guest_group_id_fkey';
            columns: ['guest_group_id'];
            isOneToOne: false;
            referencedRelation: 'wedding_guest_groups';
            referencedColumns: ['id'];
          },
        ];
      };
      wedding_responses: {
        Row: {
          attendance: boolean;
          created_at: string;
          created_by: string;
          dietary_restrictions: string | null;
          entree: string | null;
          guest_id: string;
          id: string;
          mailing_address: string | null;
          message: string;
          modified_at: string;
          modified_by: string;
        };
        Insert: {
          attendance: boolean;
          created_at?: string;
          created_by: string;
          dietary_restrictions?: string | null;
          entree?: string | null;
          guest_id: string;
          id?: string;
          mailing_address?: string | null;
          message: string;
          modified_at?: string;
          modified_by: string;
        };
        Update: {
          attendance?: boolean;
          created_at?: string;
          created_by?: string;
          dietary_restrictions?: string | null;
          entree?: string | null;
          guest_id?: string;
          id?: string;
          mailing_address?: string | null;
          message?: string;
          modified_at?: string;
          modified_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'public_wedding_responses_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'wedding_guests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_wedding_responses_guest_id_fkey';
            columns: ['guest_id'];
            isOneToOne: true;
            referencedRelation: 'wedding_guests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_wedding_responses_modified_by_fkey';
            columns: ['modified_by'];
            isOneToOne: false;
            referencedRelation: 'wedding_guests';
            referencedColumns: ['id'];
          },
        ];
      };
      wedding_song_requests: {
        Row: {
          created_at: string;
          created_by: string;
          guest_id: string;
          id: string;
          spotify_track_id: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          guest_id: string;
          id?: string;
          spotify_track_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          guest_id?: string;
          id?: string;
          spotify_track_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'public_wedding_song_requests_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'wedding_guests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'public_wedding_song_requests_guest_id_fkey';
            columns: ['guest_id'];
            isOneToOne: false;
            referencedRelation: 'wedding_guests';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] & Database['public']['Views'])
    ? (Database['public']['Tables'] & Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof Database['public']['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;
