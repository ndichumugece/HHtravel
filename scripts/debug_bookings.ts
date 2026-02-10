import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBookings() {
    console.log('Checking bookings for Feb 2026...');
    const start = '2026-02-01T00:00:00.000Z';
    const end = '2026-02-28T23:59:59.999Z';

    // Check 'bookings' table
    const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id');

    if (bookingsError) console.error('Error fetching bookings table:', bookingsError.message);
    else console.log(`'bookings' table count: ${bookingsData?.length ?? 0}`);

    // Check 'booking_vouchers' table
    const { data: vouchersData, error: vouchersError } = await supabase
        .from('booking_vouchers')
        .select('*')
        .gte('check_in_date', '2026-02-01') // Date format might be YYYY-MM-DD for this table
        .lte('check_in_date', '2026-02-28');

    if (vouchersError) {
        console.error('Error fetching booking_vouchers table:', vouchersError.message);
    } else {
        console.log(`'booking_vouchers' table count: ${vouchersData?.length ?? 0}`);
        vouchersData?.forEach(b => {
            console.log(`- Voucher: ${b.guest_name}: ${b.check_in_date} (${b.property_name})`);
        });
    }
}

checkBookings();
