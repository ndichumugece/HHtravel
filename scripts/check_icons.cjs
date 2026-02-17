
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIcons() {
    const { data: inclusions, error: incError } = await supabase.from('inclusions').select('name, icon_url');
    if (incError) console.error('Error fetching inclusions:', incError);
    else console.log('Inclusions:', JSON.stringify(inclusions, null, 2));

    const { data: exclusions, error: excError } = await supabase.from('exclusions').select('name, icon_url');
    if (excError) console.error('Error fetching exclusions:', excError);
    else console.log('Exclusions:', JSON.stringify(exclusions, null, 2));
}

checkIcons();
