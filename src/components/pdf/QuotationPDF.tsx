import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { QuotationVoucher, CompanySettings } from '../../types';
import { format } from 'date-fns';

// Register fonts
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    ],
});

const theme = {
    primary: '#7c3aed', // violet-600
    primaryLight: '#ddd6fe', // violet-200
    secondary: '#8b5cf6', // violet-500
    bgLight: '#f8fafc', // slate-50
    textMain: '#1e293b', // slate-800
    textMuted: '#64748b', // slate-500
    divider: '#e2e8f0', // slate-200
    white: '#ffffff',
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Roboto',
        color: theme.textMain,
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
    },
    logoContainer: {
        width: 150,
        height: 150,
        backgroundColor: theme.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        width: 320,
        height: 140,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    logo: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        objectPosition: 'left',
    },
    headerRight: {
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFC730',
        marginBottom: 8,
    },
    headerInfoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    headerLabel: {
        fontSize: 10,
        color: theme.textMain,
        marginRight: 5,
    },
    headerValue: {
        fontSize: 10,
        color: '#333333',
        fontWeight: 'medium',
    },

    // Sections
    sectionTitle: {
        fontSize: 12,
        color: theme.textMuted,
        marginBottom: 10,
        marginTop: 5,
    },
    subSectionTitle: {
        fontSize: 11,
        color: '#333333',
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 5,
    },

    // Client Info Card
    clientCard: {
        backgroundColor: theme.bgLight,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        flexDirection: 'row',
    },
    clientCol: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 9,
        color: theme.textMuted,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 11,
        color: theme.textMain,
        fontWeight: 'normal',
    },

    // Hotel Comparison Table
    tableSection: {
        marginTop: 10,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#FFC730',
        padding: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    tableHeaderCell: {
        flex: 1,
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333333',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: theme.divider,
        padding: 10,
        backgroundColor: theme.bgLight,
    },
    tableCell: {
        fontSize: 10,
        flex: 1,
        color: theme.textMain,
    },

    // Additional Info / Terms
    additionalSection: {
        backgroundColor: theme.bgLight,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    termTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 5,
        color: theme.textMain,
    },
    termText: {
        fontSize: 9,
        lineHeight: 1.4,
        color: theme.textMuted,
        marginBottom: 10,
    },


    // Footer / Contact
    contactSection: {
        backgroundColor: theme.bgLight,
        padding: 20,
        borderRadius: 8,
        marginTop: 20,
    },
    contactTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        color: theme.textMuted,
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactText: {
        fontSize: 10,
        color: theme.textMain,
        marginLeft: 8,
    },
});

export default function QuotationPDF({ voucher, settings, consultantName }: { voucher: QuotationVoucher, settings?: CompanySettings, consultantName?: string }) {
    if (!voucher) return null;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'dd MMM yyyy');
        } catch {
            return dateStr;
        }
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoWrapper}>
                        {settings?.logo_url ? (
                            <Image src={settings.logo_url} style={styles.logo} />
                        ) : (
                            <View style={styles.logoContainer}>
                                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>H</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.headerRight}>
                        <Text style={styles.title}>Quotation Voucher</Text>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Booking ID:</Text>
                            <Text style={styles.headerValue}>{voucher.booking_id}</Text>
                        </View>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Quotation Ref:</Text>
                            <Text style={styles.headerValue}>{voucher.reference_number || 'DRAFT'}</Text>
                        </View>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Issued Date:</Text>
                            <Text style={styles.headerValue}>{formatDate(voucher.created_at || new Date().toISOString())}</Text>
                        </View>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Travel Consultant:</Text>
                            <Text style={styles.headerValue}>{consultantName || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Client Information */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>Guest Information</Text>
                    <View style={styles.clientCard}>
                        <View style={styles.clientCol}>
                            <Text style={styles.infoLabel}>Guest Name</Text>
                            <Text style={styles.infoValue}>{voucher.client_name}</Text>
                        </View>
                        <View style={styles.clientCol}>
                            <Text style={styles.infoLabel}>Guests:</Text>
                            <Text style={styles.infoValue}>{voucher.number_of_guests}</Text>
                        </View>
                        <View style={styles.clientCol}>
                            <Text style={styles.infoLabel}>Travel Dates:</Text>
                            <Text style={styles.infoValue}>
                                {voucher.check_in_date ? formatDate(voucher.check_in_date) : 'TBD'} - {voucher.check_out_date ? formatDate(voucher.check_out_date) : 'TBD'}
                            </Text>
                            {voucher.number_of_nights && (
                                <Text style={{ fontSize: 9, color: theme.textMuted }}>({voucher.number_of_nights} Nights)</Text>
                            )}
                        </View>
                        <View style={styles.clientCol}>
                            <Text style={styles.infoLabel}>Status:</Text>
                            <Text style={styles.infoValue}>{voucher.booking_status}</Text>
                        </View>
                    </View>
                </View>

                {/* Hotel Comparison */}
                {voucher.hotel_comparison && voucher.hotel_comparison.length > 0 && (
                    <View wrap={false}>
                        <Text style={styles.sectionTitle}>Accommodation Options</Text>
                        <View style={styles.tableSection}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Property</Text>
                                <Text style={styles.tableHeaderCell}>Meal Plan</Text>
                                <Text style={styles.tableHeaderCell}>Price (Double)</Text>
                            </View>
                            {voucher.hotel_comparison.map((hotel, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>{hotel.property_name}</Text>
                                    <Text style={styles.tableCell}>{hotel.meal_plan}</Text>
                                    <Text style={styles.tableCell}>{hotel.double_price}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Inclusions & Exclusions */}
                {((voucher.inclusions?.length || 0) > 0 || (voucher.exclusions?.length || 0) > 0) && (
                    <View wrap={false}>
                        <Text style={styles.sectionTitle}>Inclusions & Exclusions</Text>
                        <View style={styles.additionalSection}>
                            {voucher.inclusions && voucher.inclusions.length > 0 && (
                                <View style={{ marginBottom: 15 }}>
                                    <Text style={[styles.termTitle, { color: theme.primary }]}>Inclusions:</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {voucher.inclusions.map((item, index) => (
                                            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 4 }}>
                                                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.primary, marginRight: 6 }} />
                                                <Text style={styles.termText}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {voucher.exclusions && voucher.exclusions.length > 0 && (
                                <View>
                                    <Text style={[styles.termTitle, { color: '#ef4444' }]}>Exclusions:</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                        {voucher.exclusions.map((item, index) => (
                                            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 4 }}>
                                                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#ef4444', marginRight: 6 }} />
                                                <Text style={styles.termText}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Inclusions & Terms */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>Details & Terms</Text>
                    <View style={styles.additionalSection}>
                        <View style={{ marginBottom: 15 }}>
                            <Text style={styles.termTitle}>What's Included (Meal Plan):</Text>
                            <Text style={styles.termText}>{voucher.meal_plan_explanation || 'Standard inclusions apply.'}</Text>
                        </View>

                        <View>
                            <Text style={styles.termTitle}>Terms & Conditions:</Text>
                            <Text style={styles.termText}>{voucher.terms_and_conditions || 'Standard terms and conditions apply.'}</Text>
                        </View>
                    </View>
                </View>

                {/* Contact Information */}
                <View wrap={false} style={styles.contactSection}>
                    <Text style={styles.contactTitle}>Company Details</Text>
                    <View style={styles.contactRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.primary, marginBottom: 5 }}>
                                {settings?.company_name || 'H&H TRAVEL'}
                            </Text>
                            {settings?.company_address && (
                                <View style={styles.contactItem}>
                                    <Text style={[styles.contactText, { marginLeft: 0 }]}>{settings.company_address}</Text>
                                </View>
                            )}
                            <View style={{ marginTop: 5 }}>
                                <Text style={[styles.contactText, { marginLeft: 0 }]}>
                                    {settings?.company_email ? `Email: ${settings.company_email}` : 'bookings@hhtravel.com'}
                                </Text>
                                {settings?.company_website && (
                                    <Text style={[styles.contactText, { marginLeft: 0 }]}>
                                        Web: {settings.company_website}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer with Images */}
                <View style={{ position: 'absolute', bottom: 30, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    {/* Center Footer Image */}
                    <View style={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 8, color: theme.divider }}>Generated by H&H Travel System</Text>
                            <Text style={{ fontSize: 8, color: theme.divider }}>{settings?.pdf_footer_text || 'Thank you for traveling with us.'}</Text>
                        </View>
                    </View>

                </View>

                {/* Right Footer Image (Corner) - Touching Edges */}
                {settings?.pdf_footer_image_right_url && (
                    <Image
                        src={settings.pdf_footer_image_right_url}
                        style={{
                            position: 'absolute',
                            bottom: -20,
                            right: -10,
                            width: 150,
                            height: 150,
                            objectFit: 'contain'
                        }}
                    />
                )}

            </Page>
        </Document>
    );
}
