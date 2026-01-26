import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { BookingVoucher, CompanySettings } from '../../types';
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
        borderRadius: 8, // Changed to rounded rect for better logo fit
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        width: 300,
        height: 120,
        justifyContent: 'center',
        alignItems: 'flex-start', // Forces image to left
    },
    logo: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        objectPosition: 'left',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    headerInfoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    headerLabel: {
        fontSize: 10,
        color: theme.textMain, // darker for visibility
        marginRight: 5,
    },
    headerValue: {
        fontSize: 10,
        color: '#333333',
        fontWeight: 'medium', // Slightly lighter than bold if supported, or normal
    },

    // Sections
    sectionTitle: {
        fontSize: 12,
        color: theme.textMuted,
        marginBottom: 10,
        marginTop: 5,
    },

    // Client Info Card
    clientCard: {
        backgroundColor: '#f0f9ff', // Light blueish tint like reference
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

    // Reservation Card
    resCard: {
        backgroundColor: theme.bgLight,
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    propertyHeader: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center',
    },
    propertyImage: {
        width: 120,
        height: 80,
        backgroundColor: '#e2e8f0',
        borderRadius: 8,
        marginRight: 15,
        objectFit: 'cover',
    },
    propertyInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    propertyName: {
        fontSize: 14,
        fontWeight: 'bold', // Keep property name bold as it is a title
        marginBottom: 5,
    },
    locationBadge: {
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    locationText: {
        fontSize: 8,
        color: theme.textMuted,
    },

    // Grid for booking details
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: '50%', // 2 columns
        marginBottom: 15,
    },

    // Amenities
    amenitiesSection: {
        backgroundColor: theme.bgLight,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    amenityRow: {
        flexDirection: 'row',
        gap: 15,
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    amenityDot: {
        fontSize: 10,
        marginRight: 5,
        color: theme.textMuted,
    },
    amenityText: {
        fontSize: 10,
        color: theme.textMuted,
    },

    // Additional Info
    additionalSection: {
        backgroundColor: theme.bgLight,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    bullet: {
        width: 3,
        height: 3,
        backgroundColor: theme.textMuted,
        borderRadius: 1.5,
        marginTop: 5,
        marginRight: 6,
    },
    bulletText: {
        fontSize: 9,
        color: theme.textMuted,
        lineHeight: 1.5,
        flex: 1,
    },

    // Footer / Contact
    contactSection: {
        backgroundColor: '#f0f9ff',
        padding: 20,
        borderRadius: 8,
        marginTop: 'auto', // Push to bottom if space permits, but usually relative flow
    },
    contactTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        color: theme.textMain,
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
        color: theme.textMuted,
        marginLeft: 8,
    },
});

interface BookingPDFProps {
    voucher: BookingVoucher;
    settings?: CompanySettings;
}

export default function BookingPDF({ voucher, settings }: BookingPDFProps) {
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
                        {/* Optional: Use settings logo if available, else a colored circle as placeholder */}
                        {settings?.logo_url ? (
                            <Image src={settings.logo_url} style={styles.logo} />
                        ) : (
                            <View style={styles.logoContainer}>
                                {/* Placeholder icon look */}
                                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>H</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.headerRight}>
                        <Text style={styles.title}>Hotel Voucher</Text>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Booking Ref:</Text>
                            <Text style={styles.headerValue}>{voucher.reference_number}</Text>
                        </View>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Issued Date:</Text>
                            <Text style={styles.headerValue}>{formatDate(voucher.created_at || new Date().toISOString())}</Text>
                        </View>
                    </View>
                </View>

                {/* Client Information */}
                <Text style={styles.sectionTitle}>Client Information</Text>
                <View style={styles.clientCard}>
                    <View style={styles.clientCol}>
                        <Text style={styles.infoLabel}>Lead Client</Text>
                        <Text style={styles.infoValue}>{voucher.guest_name}</Text>
                    </View>
                    <View style={styles.clientCol}>
                        <Text style={styles.infoLabel}>Phone number:</Text>
                        <Text style={styles.infoValue}>{voucher.guest_contact || '-'}</Text>
                    </View>
                    <View style={[styles.clientCol, { flex: 1.5 }]}>
                        {/* Assuming email isn't in BookingVoucher yet, using placeholder or deriving */}
                        <Text style={styles.infoLabel}>Nationality:</Text>
                        <Text style={styles.infoValue}>{voucher.guest_nationality || '-'}</Text>
                    </View>
                </View>

                {/* Reservation Details */}
                <Text style={styles.sectionTitle}>Reservation Details</Text>
                <View style={styles.resCard}>
                    {/* Property Header */}
                    <View style={styles.propertyHeader}>
                        <View style={styles.propertyInfo}>
                            <Text style={styles.propertyName}>{voucher.property_name}</Text>
                        </View>
                    </View>

                    {/* Grid Info */}
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Text style={styles.infoLabel}>Check-in Date:</Text>
                            <Text style={styles.infoValue}>{formatDate(voucher.check_in_date)}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.infoLabel}>Check-out Date:</Text>
                            <Text style={styles.infoValue}>{formatDate(voucher.check_out_date)}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.infoLabel}>Guests:</Text>
                            <Text style={styles.infoValue}>
                                {voucher.number_of_adults} adults, {voucher.number_of_children} children
                            </Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.infoLabel}>Number of Rooms / Type:</Text>
                            <Text style={styles.infoValue}>
                                {voucher.number_of_rooms} x {voucher.room_type || 'Standard'}
                            </Text>
                        </View>
                        <View style={[styles.gridItem, { width: '100%' }]}>
                            <Text style={styles.infoLabel}>Meal plan</Text>
                            <Text style={styles.infoValue}>{voucher.meal_plan || 'Not Specified'}</Text>
                        </View>
                    </View>
                </View>

                {/* Amenities - Static for now as not in voucher type, but matching design */}
                <Text style={styles.sectionTitle}>Paid Hotel Amenities:</Text>
                <View style={styles.amenitiesSection}>
                    <View style={styles.amenityRow}>
                        {/* Placeholders as per design */}
                        {['Wifi', 'Drinks', 'Massage'].map((amenity, i) => (
                            <View key={i} style={styles.amenityItem}>
                                <Text style={styles.amenityDot}>✓</Text>
                                <Text style={styles.amenityText}>{amenity}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Additional Information */}
                {(voucher.special_requests || voucher.flight_details) && (
                    <>
                        <Text style={styles.sectionTitle}>Additional Information</Text>
                        <View style={styles.additionalSection}>
                            <Text style={[styles.infoLabel, { marginBottom: 8 }]}>Additional Information</Text>

                            {voucher.flight_details && (
                                <View style={styles.bulletPoint}>
                                    <View style={styles.bullet} />
                                    <Text style={styles.bulletText}>{voucher.flight_details}</Text>
                                </View>
                            )}

                            {voucher.special_requests && (
                                <View style={styles.bulletPoint}>
                                    <View style={styles.bullet} />
                                    <Text style={styles.bulletText}>{voucher.special_requests}</Text>
                                </View>
                            )}

                            {/* Standard disclaimer */}
                            <View style={styles.bulletPoint}>
                                <View style={styles.bullet} />
                                <Text style={styles.bulletText}>Check-in opens 3 hours before departure (if flight included).</Text>
                            </View>
                            <View style={styles.bulletPoint}>
                                <View style={styles.bullet} />
                                <Text style={styles.bulletText}>Please ensure all travel documents are in order.</Text>
                            </View>
                        </View>
                    </>
                )}


                {/* Contact Information */}
                <View style={styles.contactSection}>
                    <Text style={styles.contactTitle}>Contact Information</Text>
                    <Text style={[styles.infoLabel, { marginBottom: 10 }]}>{settings?.company_name || 'H&H Travel'} Support:</Text>

                    <View style={styles.contactRow}>
                        <View style={{ flex: 1 }}>
                            {settings?.company_email && (
                                <View style={[styles.contactItem, { marginBottom: 5 }]}>
                                    <Text style={styles.contactText}>{settings.company_email}</Text>
                                </View>
                            )}
                            {/* Phone placeholder if not in types, or derived */}
                            <View style={styles.contactItem}>
                                <Text style={styles.contactText}>+254 700 000 000</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            {settings?.company_address && (
                                <View style={styles.contactItem}>
                                    <Text style={styles.contactText}>{settings.company_address}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Footer simple */}
                <View style={{ position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' }}>
                    <Text style={{ fontSize: 8, color: theme.divider }}>Generated by H&H Travel System</Text>
                </View>

            </Page>
        </Document>
    );
}
