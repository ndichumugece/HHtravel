import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { ConfirmationVoucher, CompanySettings } from '../../types';
import { format, differenceInDays } from 'date-fns';

// Register fonts
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    ],
});

const theme = {
    primary: '#7c3aed', // Keep fallback structure consistent, but we'll use brandYellow for theme focus
    primaryLight: '#ddd6fe',
    secondary: '#8b5cf6',
    bgLight: '#f8fafc', // slate-50
    textMain: '#1e293b', // slate-800
    textMuted: '#64748b', // slate-500
    divider: '#e2e8f0', // slate-200
    white: '#ffffff',
    brandYellow: '#FFC730', // Brand main color
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
        backgroundColor: theme.brandYellow,
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
    subSectionTitle: {
        fontSize: 11,
        color: '#333333',
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 5,
    },

    // Info Card
    card: {
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

    // Grid for stay details
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: '50%', // 2 columns
        marginBottom: 15,
    },

    // Additional Info Section
    additionalSection: {
        backgroundColor: theme.bgLight,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
});

interface ConfirmationPDFProps {
    voucher: ConfirmationVoucher;
    settings?: CompanySettings;
}

export default function ConfirmationPDF({ voucher, settings }: ConfirmationPDFProps) {
    if (!voucher) return null;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'dd MMM yyyy');
        } catch {
            return dateStr;
        }
    };

    const calculateNights = (checkIn?: string, checkOut?: string) => {
        if (!checkIn || !checkOut) return 0;
        try {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            return differenceInDays(end, start);
        } catch {
            return 0;
        }
    };

    const hasContent = (str?: string) => {
        if (!str || !str.trim()) return false;
        const lower = str.trim().toLowerCase();
        const invalid = ['no special request', 'no special requests', 'none', 'n/a', 'nil', '-', 'no', 'null', 'undefined'];
        return !invalid.includes(lower);
    };

    const hasSpecialRequests = voucher.show_special_requests !== false && hasContent(voucher.special_requests);
    const hasFlightDetails = voucher.show_flight_details !== false && (hasContent(voucher.flight_details) || hasContent(voucher.arrival_time) || hasContent(voucher.departure_time));

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
                        <Text style={styles.title}>Confirmation Voucher</Text>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Voucher Ref:</Text>
                            <Text style={styles.headerValue}>{voucher.reference_number || 'DRAFT'}</Text>
                        </View>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Property Name:</Text>
                            <Text style={styles.headerValue}>{voucher.property_name || 'N/A'}</Text>
                        </View>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Issued Date:</Text>
                            <Text style={styles.headerValue}>{formatDate(voucher.created_at || new Date().toISOString())}</Text>
                        </View>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Travel Consultant:</Text>
                            <Text style={styles.headerValue}>
                                {(Array.isArray(voucher.profiles) ? voucher.profiles[0]?.full_name : voucher.profiles?.full_name) || 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Guest Information */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>Guest Information</Text>
                    <View style={styles.card}>
                        <View style={styles.clientCol}>
                            <Text style={styles.infoLabel}>Guest Name</Text>
                            <Text style={styles.infoValue}>{voucher.guest_name}</Text>
                        </View>
                        <View style={styles.clientCol}>
                            <Text style={styles.infoLabel}>Primary Contact:</Text>
                            <Text style={styles.infoValue}>{voucher.guest_contact || '-'}</Text>
                        </View>
                        <View style={[styles.clientCol, { flex: 1.5 }]}>
                            <Text style={styles.infoLabel}>Nationality:</Text>
                            <Text style={styles.infoValue}>{voucher.guest_nationality || '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* Stay Information */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>Stay Information</Text>
                    <View style={[styles.card, { flexDirection: 'column' }]}>
                        <View style={styles.grid}>
                            <View style={styles.gridItem}>
                                <Text style={styles.infoLabel}>Check-in Date:</Text>
                                <Text style={styles.infoValue}>{formatDate(voucher.check_in_date)}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.infoLabel}>Check-out Date:</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.infoValue}>{formatDate(voucher.check_out_date)}</Text>
                                    <Text style={[styles.infoValue, { marginLeft: 5, color: theme.textMuted, fontSize: 10 }]}>
                                        ({calculateNights(voucher.check_in_date, voucher.check_out_date)} nights)
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.infoLabel}>Meal Plan:</Text>
                                <Text style={styles.infoValue}>{voucher.meal_plan || 'Not Specified'}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.infoLabel}>Number of Rooms:</Text>
                                <Text style={styles.infoValue}>{voucher.number_of_rooms || 1} Rooms</Text>
                            </View>
                        </View>

                        {/* Room Configuration List */}
                        {voucher.room_details && voucher.room_details.length > 0 && (
                            <View style={{ borderTopWidth: 1, borderTopColor: theme.divider, marginTop: 10, paddingTop: 10 }}>
                                <Text style={[styles.infoLabel, { marginBottom: 5 }]}>Room Configurations:</Text>
                                {voucher.room_details.map((room, index) => (
                                    <View key={index} style={{ flexDirection: 'row', marginBottom: 3, flexWrap: 'wrap' }}>
                                        <Text style={{ fontSize: 9, marginRight: 5 }}>• Room {index + 1}:</Text>
                                        <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{room.room_type || 'Standard'}</Text>
                                        {room.bed_type && (
                                            <>
                                                <Text style={{ fontSize: 9, marginHorizontal: 3 }}>|</Text>
                                                <Text style={{ fontSize: 9 }}>{room.bed_type}</Text>
                                            </>
                                        )}
                                        <Text style={{ fontSize: 9, marginHorizontal: 3 }}>|</Text>
                                        <Text style={{ fontSize: 9 }}>{room.adults} Adults, {room.children} Children</Text>
                                        {room.children > 0 && room.child_ages && room.child_ages.length > 0 && (
                                            <>
                                                <Text style={{ fontSize: 9, marginHorizontal: 3 }}>|</Text>
                                                <Text style={{ fontSize: 9 }}>Ages: {room.child_ages.join(', ')}</Text>
                                            </>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {voucher.room_arrangements && (
                            <View style={{ borderTopWidth: 1, borderTopColor: theme.divider, marginTop: 10, paddingTop: 10 }}>
                                <Text style={styles.infoLabel}>Room Arrangements / Extra Beds:</Text>
                                <Text style={styles.infoValue}>{voucher.room_arrangements}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Transport & Flight Details */}
                {hasFlightDetails && (
                    <View wrap={false}>
                        <Text style={styles.sectionTitle}>Transport & Flight Details</Text>
                        <View style={styles.card}>
                            {voucher.flight_details && (
                                <View style={styles.clientCol}>
                                    <Text style={styles.infoLabel}>Flight Details</Text>
                                    <Text style={styles.infoValue}>{voucher.flight_details}</Text>
                                </View>
                            )}
                            {voucher.arrival_time && (
                                <View style={styles.clientCol}>
                                    <Text style={styles.infoLabel}>Arrival Time</Text>
                                    <Text style={styles.infoValue}>{voucher.arrival_time}</Text>
                                </View>
                            )}
                            {voucher.departure_time && (
                                <View style={styles.clientCol}>
                                    <Text style={styles.infoLabel}>Departure Time</Text>
                                    <Text style={styles.infoValue}>{voucher.departure_time}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Special Requests */}
                {hasSpecialRequests && (
                    <View wrap={false}>
                        <Text style={styles.sectionTitle}>Special Requests / Notes</Text>
                        <View style={styles.additionalSection}>
                            <Text style={{ fontSize: 10, lineHeight: 1.5, color: theme.textMain }}>
                                {voucher.special_requests}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Footer Section */}
                <View wrap={false} style={{ marginTop: 'auto', paddingTop: 20, borderTopWidth: 1, borderTopColor: theme.divider, flexDirection: 'row', justifyContent: 'space-between' }}>
                    {/* Left: Address and website */}
                    <View style={{ flex: 1 }}>
                        {settings?.company_address && settings.company_address.split('\n').map((line, index) => (
                            <Text key={index} style={{
                                fontSize: index === 0 ? 10 : 9,
                                fontWeight: index === 0 ? 'bold' : 'normal',
                                color: index === 0 ? theme.textMain : '#64748B',
                                marginBottom: 2
                            }}>
                                {line}
                            </Text>
                        ))}
                        {settings?.company_email && (
                            <Text style={{ fontSize: 9, color: '#64748B', marginBottom: 2 }}>
                                {settings.company_email}
                            </Text>
                        )}
                        {settings?.company_website && (
                            <Text style={{ fontSize: 9, color: '#64748B', marginBottom: 2 }}>
                                {settings.company_website}
                            </Text>
                        )}
                    </View>

                    {/* Right: Logo */}
                    {settings?.logo_url && (
                        <View style={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                            <Image
                                src={settings.logo_url}
                                style={{ width: 250, height: 120, objectFit: 'contain' }}
                            />
                        </View>
                    )}
                </View>

                {/* Bottom line */}
                <View style={{ position: 'absolute', bottom: 30, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 8, color: theme.divider }}>Generated by H&H Travel System</Text>
                    <Text style={{ fontSize: 8, color: theme.divider }}>{settings?.pdf_footer_text || 'Thank you for choosing H&H Travel.'}</Text>
                </View>

                {/* Corner background footer image */}
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
