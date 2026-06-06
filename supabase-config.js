const SUPABASE_URL = 'https://bweduqkqfiaawpkkbqww.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Y4eDReOMy-fF-yRYgHfO1A_poIj0HwU';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);