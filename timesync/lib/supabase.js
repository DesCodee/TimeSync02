import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ccyvkystrqfyhstjsfzy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjeXZreXN0cnFmeWhzdGpzZnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMTAwMjEsImV4cCI6MjA5Nzc4NjAyMX0.7Bs75JlBViic5vUmMFmGbNJW8YL7QPSauurkRWp9Xls";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
