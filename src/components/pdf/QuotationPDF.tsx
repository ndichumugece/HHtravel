import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { QuotationVoucher, CompanySettings } from '../../types';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
        paddingBottom: 10,
    },
    headerLeft: {
        flexDirection: 'column',
        flex: 1,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0c4a6e',
        marginBottom: 5,
    },
    companyInfo: {
        fontSize: 10,
        color: '#555555',
    },
    logo: {
        width: 80,
        height: 80,
        objectFit: 'contain',
    },
    titleSection: {
        marginBottom: 20,
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 12,
        marginTop: 5,
        color: '#64748b',
    },
    clientSection: {
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: 100,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748b',
    },
    value: {
        flex: 1,
        fontSize: 10,
    },
    comparisonTable: {
        marginTop: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#0c4a6e',
        padding: 8,
    },
    tableHeaderCell: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        flex: 1,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        padding: 8,
    },
    tableCell: {
        fontSize: 10,
        flex: 1,
    },
    termsSection: {
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    },
    termTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#0c4a6e',
    },
    termText: {
        fontSize: 9,
        lineHeight: 1.4,
        color: '#475569',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 9,
        color: '#999999',
        borderTopWidth: 1,
        borderTopColor: '#cccccc',
        paddingTop: 10,
    },
});

export default function QuotationPDF({ voucher, settings }: { voucher: QuotationVoucher, settings?: CompanySettings }) {
    if (!voucher) return null;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.companyName}>{settings?.company_name || 'H&H TRAVEL'}</Text>
                        <Text style={styles.companyInfo}>{settings?.company_address || '123 Business Street, Tourism City'}</Text>
                        <Text style={styles.companyInfo}>
                            {settings?.company_email ? `Email: ${settings.company_email}` : 'bookings@hhtravel.com'}
                            {settings?.company_email && settings?.company_website ? ' | ' : ''}
                            {settings?.company_website ? `Web: ${settings.company_website}` : ''}
                        </Text>
                    </View>
                    <View>
                        {settings?.logo_url && (
                            /* eslint-disable-next-line jsx-a11y/alt-text */
                            <Image src={settings.logo_url} style={styles.logo} />
                        )}
                    </View>
                </View>

                {/* Title */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>Quotation: {voucher.package_type || 'Travel Package'}</Text>
                    <Text style={styles.subtitle}>Ref: {voucher.reference_number} | For: {voucher.client_name}</Text>
                </View>

                {/* Client & Stay Info */}
                <View style={styles.clientSection}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Guests:</Text>
                        <Text style={styles.value}>{voucher.number_of_guests}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Travel Dates:</Text>
                        <Text style={styles.value}>
                            {voucher.check_in_date ? format(new Date(voucher.check_in_date), 'MMM d, yyyy') : 'TBD'} - {voucher.check_out_date ? format(new Date(voucher.check_out_date), 'MMM d, yyyy') : 'TBD'}
                            {voucher.number_of_nights ? ` (${voucher.number_of_nights} Nights)` : ''}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Status:</Text>
                        <Text style={styles.value}>{voucher.booking_status}</Text>
                    </View>
                </View>

                {/* Hotel Comparison */}
                {voucher.hotel_comparison && voucher.hotel_comparison.length > 0 && (
                    <View style={styles.comparisonTable}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Property</Text>
                            <Text style={styles.tableHeaderCell}>Meal Plan</Text>
                            <Text style={styles.tableHeaderCell}>Dbl Price</Text>
                        </View>
                        {voucher.hotel_comparison.map((hotel, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>{hotel.property_name}</Text>
                                <Text style={styles.tableCell}>{hotel.meal_plan}</Text>
                                <Text style={styles.tableCell}>{hotel.double_price}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Terms */}
                <View style={styles.termsSection}>
                    <Text style={styles.termTitle}>What's Included</Text>
                    <Text style={styles.termText}>{voucher.meal_plan_explanation || 'Standards inclusion apply.'}</Text>

                    <Text style={[styles.termTitle, { marginTop: 10 }]}>Terms & Conditions</Text>
                    <Text style={styles.termText}>{voucher.terms_and_conditions}</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>{settings?.pdf_footer_text || 'Thank you for tracking with us.'}</Text>
                </View>
            </Page>
        </Document>
    );
}
