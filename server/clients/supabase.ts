import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Database } from 'types/supabase';

class SupabaseClientFactory {
  private static readonly instance = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  public static getInstance(): SupabaseClient {
    return SupabaseClientFactory.instance;
  }
}

export default SupabaseClientFactory;
