import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { TrainReceipt, CompanySettings } from '../../types';
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
    brandYellow: '#FFC730',
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
        color: theme.brandYellow,
        marginBottom: 8,
        textTransform: 'uppercase',
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
        fontWeight: 'bold',
    },

    // Sections
    sectionTitle: {
        fontSize: 12,
        color: theme.textMuted,
        marginBottom: 10,
        marginTop: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // Info Cards
    card: {
        backgroundColor: theme.bgLight,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    infoCol: {
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

    // Guest Table
    table: {
        marginTop: 10,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: theme.brandYellow,
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

    // Disclaimer
    disclaimerSection: {
        marginTop: 'auto',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: theme.divider,
    },
    disclaimerText: {
        fontSize: 9,
        color: theme.textMuted,
        lineHeight: 1.4,
        textAlign: 'center',
    },

    // Footer
    footer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 8,
        color: theme.textMuted,
    }
});

export default function TrainReceiptPDF({ receipt, settings, consultantName }: { receipt: TrainReceipt, settings?: CompanySettings, consultantName?: string }) {
    if (!receipt) return null;

    const formatDate = (dateStr?: string) => {
        if (!dateStr || dateStr.trim() === '') return 'TBD';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr || 'TBD';
            return format(date, 'dd MMM yyyy');
        } catch {
            return dateStr || 'TBD';
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
                        <Text style={styles.title}>Train Ticket</Text>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Reference:</Text>
                            <Text style={styles.headerValue}>{receipt.reference_number || 'DRAFT'}</Text>
                        </View>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Issued Date:</Text>
                            <Text style={styles.headerValue}>{receipt.created_at ? formatDate(receipt.created_at) : format(new Date(), 'dd MMM yyyy')}</Text>
                        </View>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Consultant:</Text>
                            <Text style={styles.headerValue}>{consultantName || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Client Information */}
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <View style={[styles.infoCol, { flex: 2 }]}>
                            <Text style={styles.infoLabel}>Client Name</Text>
                            <Text style={styles.infoValue}>{receipt.client_name}</Text>
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>Mobile Number</Text>
                            <Text style={styles.infoValue}>{receipt.mobile_number || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Journey Details */}
                <Text style={styles.sectionTitle}>Journey Details</Text>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>Train Type</Text>
                            <Text style={styles.infoValue}>{receipt.train_type}</Text>
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>Ticket Number</Text>
                            <Text style={styles.infoValue}>{receipt.ticket_number || 'N/A'}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>From</Text>
                            <Text style={styles.infoValue}>{receipt.from_station}</Text>
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>To</Text>
                            <Text style={styles.infoValue}>{receipt.to_station}</Text>
                        </View>
                    </View>
262: 
                    <View style={styles.infoRow}>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>Departure Date</Text>
                            <Text style={styles.infoValue}>{formatDate(receipt.departure_date)}</Text>
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>Departure Time</Text>
                            <Text style={styles.infoValue}>{receipt.departure_time}</Text>
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>Arrival Time</Text>
                            <Text style={styles.infoValue}>{receipt.arrival_time}</Text>
                        </View>
                    </View>
                </View>

                {/* Return Journey Details */}
                {receipt.has_return_journey && (
                    <View wrap={false}>
                        <Text style={styles.sectionTitle}>Return Journey Details</Text>
                        <View style={styles.card}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoCol}>
                                    <Text style={styles.infoLabel}>Train Type (Return)</Text>
                                    <Text style={styles.infoValue}>{receipt.return_train_type}</Text>
                                </View>
                                <View style={styles.infoCol}>
                                    <Text style={styles.infoLabel}>Ticket Number (Return)</Text>
                                    <Text style={styles.infoValue}>{receipt.return_ticket_number || 'N/A'}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.infoRow}>
                                <View style={styles.infoCol}>
                                    <Text style={styles.infoLabel}>From</Text>
                                    <Text style={styles.infoValue}>{receipt.return_from_station}</Text>
                                </View>
                                <View style={styles.infoCol}>
                                    <Text style={styles.infoLabel}>To</Text>
                                    <Text style={styles.infoValue}>{receipt.return_to_station}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={styles.infoCol}>
                                    <Text style={styles.infoLabel}>Departure Date</Text>
                                    <Text style={styles.infoValue}>{formatDate(receipt.return_departure_date)}</Text>
                                </View>
                                <View style={styles.infoCol}>
                                    <Text style={styles.infoLabel}>Departure Time</Text>
                                    <Text style={styles.infoValue}>{receipt.return_departure_time}</Text>
                                </View>
                                <View style={styles.infoCol}>
                                    <Text style={styles.infoLabel}>Arrival Time</Text>
                                    <Text style={styles.infoValue}>{receipt.return_arrival_time}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Guest Assignments (Departure) */}
                <Text style={styles.sectionTitle}>Guest Assignments (Departure)</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Guest Name</Text>
                        <Text style={styles.tableHeaderCell}>Coach No</Text>
                        <Text style={styles.tableHeaderCell}>Seat Number</Text>
                    </View>
                    {(receipt.guests || []).map((guest, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 2 }]}>{guest.name || 'N/A'}</Text>
                            <Text style={styles.tableCell}>{guest.coach_no || '-'}</Text>
                            <Text style={styles.tableCell}>{guest.seat_no || '-'}</Text>
                        </View>
                    ))}
                    {(!receipt.guests || receipt.guests.length === 0) && (
                        <View style={styles.tableRow}>
                            <Text style={[styles.tableCell, { textAlign: 'center', flex: 1 }]}>No guests assigned</Text>
                        </View>
                    )}
                </View>

                {/* Guest Assignments (Return) */}
                {receipt.has_return_journey && (
                    <View wrap={false}>
                        <Text style={styles.sectionTitle}>Guest Assignments (Return)</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Guest Name</Text>
                                <Text style={styles.tableHeaderCell}>Coach No</Text>
                                <Text style={styles.tableHeaderCell}>Seat Number</Text>
                            </View>
                            {(receipt.return_guests || []).map((guest, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { flex: 2 }]}>{guest.name || 'N/A'}</Text>
                                    <Text style={styles.tableCell}>{guest.coach_no || '-'}</Text>
                                    <Text style={styles.tableCell}>{guest.seat_no || '-'}</Text>
                                </View>
                            ))}
                            {(!receipt.return_guests || receipt.return_guests.length === 0) && (
                                <View style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { textAlign: 'center', flex: 1 }]}>No return guests assigned</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Disclaimer */}
                <View style={styles.disclaimerSection}>
                    <Text style={styles.disclaimerText}>
                        Disclaimer: This is an auto-generated ticket by H&H Travel and not generated by Kenya Railways. 
                        This document serves as proof of booking through our agency. For official tickets and boardings, 
                        please ensure you have the original SGR ticket or M-Pesa confirmation as required by Kenya Railways.
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Generated by H&H Travel System</Text>
                    <Text style={styles.footerText}>{settings?.company_website || 'www.hhtravel.com'}</Text>
                </View>

                {/* Right Footer Image (Corner) - if available */}
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
