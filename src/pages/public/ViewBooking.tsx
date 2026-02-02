import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import { supabase } from '../../lib/supabase';
import BookingPDF from '../../components/pdf/BookingPDF';
import type { BookingVoucher, CompanySettings } from '../../types';
import { Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

export default function ViewBooking() {
    const { id } = useParams<{ id: string }>();
    const [voucher, setVoucher] = useState<BookingVoucher | null>(null);
    const [settings, setSettings] = useState<CompanySettings>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch Voucher
                const { data: voucherData, error: voucherError } = await supabase
                    .from('booking_vouchers')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (voucherError) throw voucherError;
                setVoucher(voucherData);

                // Fetch Settings
                const { data: settingsData } = await supabase
                    .from('company_settings')
                    .select('*')
                    .single();

                if (settingsData) setSettings(settingsData);

                // Generate QR Code
                const productionUrl = `https://portal.hhtravel.co/public/bookings/${id}`;
                try {
                    const url = await QRCode.toDataURL(productionUrl);
                    setQrCodeUrl(url);
                } catch (qrError) {
                    console.error('Error generating QR code', qrError);
                }

            } catch (err: any) {
                console.error('Error fetching booking:', err);
                setError('Failed to load booking details. It may not exist or you may not have permission.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !voucher) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
                <p className="text-destructive font-medium">{error || 'Booking not found'}</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-gray-100 p-4 sm:p-8">
            <div className="mx-auto h-full max-w-5xl overflow-hidden rounded-lg shadow-xl bg-white">
                <PDFViewer width="100%" height="100%" className="border-none">
                    <BookingPDF voucher={voucher} settings={settings} qrCodeUrl={qrCodeUrl} />
                </PDFViewer>
            </div>
        </div>
    );
}
