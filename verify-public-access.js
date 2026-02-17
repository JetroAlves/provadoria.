
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing credentials in .env');
    process.exit(1);
}

// Create Supabase client WITHOUT auth session (simulating public user)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyPublicAccess() {
    const storeSlug = 'teste-boutique'; // Assuming this exists based on the user's screenshots

    console.log(`Verifying public access for store: ${storeSlug}...`);

    try {
        // 1. Fetch profile by slug
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .eq('store_slug', storeSlug)
            .single();

        if (pError) {
            console.error('Error fetching profile:', pError.message);
            return;
        }

        console.log('Profile fetched successfully:', profile.store_name);

        // 2. Fetch categories
        const { data: categories, error: cError } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', profile.id);

        if (cError) {
            console.warn('Warning: Error fetching categories:', cError.message);
        } else {
            console.log(`Categories fetched: ${categories.length}`);
        }

        // 3. Fetch products
        const { data: products, error: prError } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', profile.id);

        if (prError) {
            console.error('Error fetching products:', prError.message);
        } else {
            console.log(`Products fetched: ${products.length}`);
        }

    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

verifyPublicAccess();
