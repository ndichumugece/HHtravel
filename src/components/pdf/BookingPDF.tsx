import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { BookingVoucher, CompanySettings } from '../../types';
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
        // width: '100%', // Removed to allow it to sit on the right
    },
    title: {
        fontSize: 18,
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

    // Reservation Card
    resCard: {
        backgroundColor: theme.bgLight,
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    propertyHeader: {
        marginBottom: 15,
        alignItems: 'center',
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


    // Grid for booking details
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: '50%', // 2 columns
        marginBottom: 15,
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

interface BookingPDFProps {
    voucher: BookingVoucher;
    settings?: CompanySettings;
    qrCodeUrl?: string; // Add optional QR code URL prop
}

export default function BookingPDF({ voucher, settings, qrCodeUrl }: BookingPDFProps) {
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

    const hasSpecialRequests = hasContent(voucher.special_requests);
    const hasDietaryRequirements = hasContent(voucher.dietary_requirements);

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
                        <Text style={styles.title}>Booking Voucher</Text>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Booking Ref:</Text>
                            <Text style={styles.headerValue}>{voucher.reference_number}</Text>
                        </View>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Property Name:</Text>
                            <Text style={styles.headerValue}>{voucher.property_name}</Text>
                        </View>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Issued Date:</Text>
                            <Text style={styles.headerValue}>{formatDate(voucher.created_at || new Date().toISOString())}</Text>
                        </View>
                        <View style={styles.headerInfoRow}>
                            <Text style={styles.headerLabel}>Travel Consultant:</Text>
                            <Text style={styles.headerValue}>{(Array.isArray(voucher.profiles) ? voucher.profiles[0]?.full_name : voucher.profiles?.full_name) || 'N/A'}</Text>
                        </View>
                        {qrCodeUrl && (
                            <View style={{ marginTop: 10, alignItems: 'flex-start' }}>
                                <Image src={qrCodeUrl} style={{ width: 60, height: 60 }} />
                                <Text style={{ fontSize: 8, color: theme.divider, marginTop: 4 }}>Scan for softcopy</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Client Information */}
                {/* Client Information */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>Guest Information</Text>
                    <View style={styles.clientCard}>
                        <View style={styles.clientCol}>
                            <Text style={styles.infoLabel}>Guest Name</Text>
                            <Text style={styles.infoValue}>{voucher.guest_name}</Text>
                        </View>
                        <View style={styles.clientCol}>
                            <Text style={styles.infoLabel}>Primary Contact:</Text>
                            <Text style={styles.infoValue}>{voucher.guest_contact || '-'}</Text>
                        </View>
                        <View style={[styles.clientCol, { flex: 1.5 }]}>
                            {/* Assuming email isn't in BookingVoucher yet, using placeholder or deriving */}
                            <Text style={styles.infoLabel}>Nationality:</Text>
                            <Text style={styles.infoValue}>{voucher.guest_nationality || '-'}</Text>
                        </View>
                    </View>
                    {voucher.additional_guest_info && (
                        <View style={styles.clientCard}>
                            <View style={styles.clientCol}>
                                <Text style={styles.infoLabel}>Additional Guest Information:</Text>
                                <Text style={styles.infoValue}>{voucher.additional_guest_info}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Reservation Details */}
                {/* Reservation Details */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>Reservation Details</Text>
                    <View style={styles.resCard}>


                        {/* Grid Info */}
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
                            {voucher.room_details && voucher.room_details.length > 0 ? (
                                <View style={[styles.gridItem, { width: '100%', flexDirection: 'column', alignItems: 'flex-start' }]}>
                                    <Text style={[styles.infoLabel, { marginBottom: 5 }]}>Room Configuration:</Text>
                                    {voucher.room_details.map((room, index) => (
                                        <View key={index} style={{ flexDirection: 'row', marginBottom: 2, width: '100%', flexWrap: 'wrap' }}>
                                            <Text style={{ fontSize: 9, marginRight: 5 }}>• Room {index + 1}:</Text>
                                            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{room.room_type}</Text>
                                            <Text style={{ fontSize: 9, marginHorizontal: 3 }}>|</Text>
                                            <Text style={{ fontSize: 9 }}>{room.bed_type}</Text>
                                            <Text style={{ fontSize: 9, marginHorizontal: 3 }}>|</Text>
                                            <Text style={{ fontSize: 9 }}>{room.adults} Adults, {room.children} Child</Text>
                                            {room.children > 0 && room.child_ages && room.child_ages.length > 0 && (
                                                <>
                                                    <Text style={{ fontSize: 9, marginHorizontal: 3 }}>|</Text>
                                                    <Text style={{ fontSize: 9 }}>Ages: {room.child_ages.join(', ')}</Text>
                                                </>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.gridItem}>
                                    <Text style={styles.infoLabel}>Room Configuration:</Text>
                                    <Text style={styles.infoValue}>
                                        {voucher.number_of_rooms} Rooms (Details not specified)
                                    </Text>
                                </View>
                            )}
                            <View style={styles.gridItem}>
                                <Text style={styles.infoLabel}>Meal plan</Text>
                                <Text style={styles.infoValue}>{voucher.meal_plan || 'Not Specified'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Transport Details */}
                {/* Arrival Transfer */}
                {/* Transport Details */}
                {/* Transport Details */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>Transport Details</Text>

                    {/* Arrival Transfer */}
                    <View style={[styles.clientCard, { flexDirection: 'column' }]}>
                        {/* Arrival Transfer */}
                        <View style={{ width: '100%', marginBottom: 10 }}>
                            <Text style={styles.subSectionTitle}>Arrival Transfer</Text>
                        </View>
                        <View style={{ flexDirection: 'row', width: '100%' }}>
                            <View style={styles.clientCol}>
                                <Text style={styles.infoLabel}>Mode of Transport:</Text>
                                <Text style={styles.infoValue}>{voucher.mode_of_transport || 'Not Specified'}</Text>
                            </View>

                            {voucher.mode_of_transport === 'Flying' && (
                                <View style={styles.clientCol}>
                                    <Text style={styles.infoLabel}>Airline:</Text>
                                    <Text style={styles.infoValue}>{voucher.airline || 'Not Specified'}</Text>
                                </View>
                            )}

                            {voucher.mode_of_transport === 'Flying' && voucher.flight_arrival_date && (
                                <View style={styles.clientCol}>
                                    <Text style={styles.infoLabel}>Date:</Text>
                                    <Text style={styles.infoValue}>{formatDate(voucher.flight_arrival_date)}</Text>
                                </View>
                            )}

                            <View style={styles.clientCol}>
                                <Text style={styles.infoLabel}>Estimated Arrival Time:</Text>
                                <Text style={styles.infoValue}>{voucher.arrival_time || 'Not Specified'}</Text>
                            </View>
                        </View>


                        {/* Departure Transfer */}
                        {voucher.departure_mode_of_transport && (
                            <>
                                <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: '#e2e8f0', marginTop: 10, paddingTop: 10, marginBottom: 10 }}>
                                    <Text style={styles.subSectionTitle}>Departure Transfer</Text>
                                </View>
                                <View style={{ flexDirection: 'row', width: '100%' }}>
                                    <View style={styles.clientCol}>
                                        <Text style={styles.infoLabel}>Mode of Transport:</Text>
                                        <Text style={styles.infoValue}>{voucher.departure_mode_of_transport}</Text>
                                    </View>

                                    {voucher.departure_mode_of_transport === 'Flying' && (
                                        <View style={styles.clientCol}>
                                            <Text style={styles.infoLabel}>Airline:</Text>
                                            <Text style={styles.infoValue}>{voucher.departure_airline || 'Not Specified'}</Text>
                                        </View>
                                    )}

                                    {voucher.departure_mode_of_transport === 'Flying' && voucher.flight_departure_date && (
                                        <View style={styles.clientCol}>
                                            <Text style={styles.infoLabel}>Date:</Text>
                                            <Text style={styles.infoValue}>{formatDate(voucher.flight_departure_date)}</Text>
                                        </View>
                                    )}

                                    <View style={styles.clientCol}>
                                        <Text style={styles.infoLabel}>Estimated Departure Time:</Text>
                                        <Text style={styles.infoValue}>{voucher.departure_time || 'Not Specified'}</Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {voucher.special_transport_note && (
                        <View style={styles.clientCard}>
                            <View style={styles.clientCol}>
                                <Text style={styles.infoLabel}>Special Transport Note:</Text>
                                <Text style={styles.infoValue}>{voucher.special_transport_note}</Text>
                            </View>
                        </View>
                    )}
                </View>




                {/* Additional Information */}
                {/* Additional Information */}
                {
                    (hasSpecialRequests || hasDietaryRequirements) && (
                        <View wrap={false}>
                            <Text style={styles.sectionTitle}>Additional Information</Text>
                            <View style={[styles.additionalSection, { flexDirection: 'column' }]}>

                                {hasDietaryRequirements && (
                                    <View style={{ marginBottom: hasSpecialRequests ? 10 : 0 }}>
                                        <Text style={styles.infoLabel}>Dietary Requests:</Text>
                                        <Text style={styles.infoValue}>{voucher.dietary_requirements}</Text>
                                    </View>
                                )}

                                {hasSpecialRequests && (
                                    <View>
                                        <Text style={styles.infoLabel}>Special Requests:</Text>
                                        <Text style={styles.infoValue}>{voucher.special_requests}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )
                }


                {/* Contact Information */}
                <View wrap={false} style={styles.contactSection}>
                    <Text style={styles.contactTitle}>Company Details</Text>
                    <View style={styles.contactRow}>
                        <View style={{ flex: 1 }}>
                            {settings?.company_address && (
                                <View style={styles.contactItem}>
                                    <Text style={styles.contactText}>{settings.company_address}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Footer with QR Code */}
                <View style={{ position: 'absolute', bottom: 30, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    {/* Center Footer Image */}
                    <View style={{ flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                        {settings?.pdf_footer_image_url && (
                            <Image
                                src={settings.pdf_footer_image_url}
                                style={{ width: 250, height: 45, objectFit: 'contain', marginBottom: 5 }}
                            />
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 8, color: theme.divider }}>Generated by H&H Travel System</Text>
                        </View>
                    </View>

                    {/* Right Footer Image (Corner) */}
                    {settings?.pdf_footer_image_right_url && (
                        <Image
                            src={settings.pdf_footer_image_right_url}
                            style={{ position: 'absolute', bottom: 0, right: 0, width: 100, height: 100, objectFit: 'contain' }}
                        />
                    )}
                </View>

            </Page >
        </Document >
    );
}
