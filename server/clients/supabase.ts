import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Database } from 'types/supabase';

class SupabaseClientFactory {
  private static readonly instance = createClient<Database>(
    'https://' + process.env.SUPABASE_PROJECT_ID + '.supabase.co',
    process.env.SUPABASE_KEY,
  );
  public static getInstance(): SupabaseClient {
    return SupabaseClientFactory.instance;
  }
}

export default SupabaseClientFactory;
