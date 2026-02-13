
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log(`Testing connection to ${supabaseUrl}...`);
    try {
        const { data, error } = await supabase.from('user_subscriptions').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Connection Failed:', error.message);
            console.error('Error Details:', error);
        } else {
            console.log('Connection Successful!');
            console.log('Data:', data);
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testConnection();
