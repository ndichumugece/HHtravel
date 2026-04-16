export interface Property {
    id: string;
    name: string;
    location: string;
    contact_info: {
        phone?: string;
        email?: string;
        website?: string;
    };
    images: string[];
    created_at: string;
}

export interface BookingVoucher {
    id: string;
    reference_number: string;
    consultant_id: string;
    guest_name: string;
    guest_nationality?: string;
    additional_guest_info?: string;
    guest_contact?: string;
    check_in_date: string;
    check_out_date: string;
    number_of_nights: number;
    property_name: string;
    room_type?: string;
    package_type?: string;
    bed_type?: string;
    meal_plan?: string;
    number_of_rooms: number;
    number_of_adults: number;
    number_of_children: number;
    quotation_price?: number;
    special_requests?: string;
    flight_details?: string;
    arrival_time?: string;
    airline?: string;
    flight_arrival_date?: string;
    mode_of_transport?: string;

    departure_mode_of_transport?: string;
    departure_airline?: string;
    flight_departure_date?: string;
    departure_time?: string;
    special_transport_note?: string;
    driver_contact?: string;
    dietary_requirements?: string;

    status: 'issued' | 'cancelled';
    payment_status?: 'pending' | 'discounted' | 'completed';
    created_at: string;
    lead_source?: string;
    room_details?: RoomDetail[];
    profiles?: {
        full_name: string;
        color?: string;
    } | null;
}

export interface RoomDetail {
    id: string; // for key
    room_type: string;
    bed_type: string;
    adults: number;
    children: number;
    child_ages?: number[];
}

export interface QuotationVoucher {
    id: string;
    booking_id?: string;
    reference_number: string;
    consultant_id: string;
    client_name: string;
    package_type?: string;
    booking_status: 'Tentative' | 'Confirmed';
    check_in_date?: string;
    check_out_date?: string;
    number_of_nights?: number;
    number_of_guests?: string;
    number_of_adults?: number;
    number_of_children?: number;
    number_of_rooms?: number;
    hotel_comparison?: HotelComparison[];
    includes_list?: string[];
    meal_plan_explanation?: string;
    terms_and_conditions?: string;
    inclusions?: string[];
    exclusions?: string[];
    show_hotel_comparison?: boolean;
    show_inclusions_exclusions?: boolean;
    created_at?: string;
    profiles?: {
        full_name: string;
    } | null;
    room_arrangements?: string;
    rich_text_notes?: string;
    travel_date_type?: 'specific' | 'month';
    travel_month?: string;
}

export interface HotelComparison {
    property_name: string;
    meal_plan: string;
    single_price: string;
    double_price: string;
    description?: string;
}

export interface CompanySettings {
    id: string;
    company_name: string;
    company_email?: string;
    company_address?: string;
    company_website?: string;
    logo_url?: string;
    pdf_footer_text?: string;
    pdf_footer_image_url?: string;
    pdf_footer_image_right_url?: string;
    terms_and_conditions?: string;
}

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'consultant';
    color?: string;
    avatar_url?: string;
    last_active?: string;
    created_at: string;
}

export interface Inclusion {
    id: string;
    name: string;
    slug: string;
    icon_url?: string;
    is_published: boolean;
    created_at?: string;
}

export interface Exclusion {
    id: string;
    name: string;
    slug: string;
    icon_url?: string;
    is_published: boolean;
    created_at?: string;
}

export interface ConfirmationVoucher {
    id: string;
    reference_number: string;
    consultant_id: string;
    guest_name: string;
    guest_nationality?: string;
    guest_contact?: string;
    check_in_date: string;
    check_out_date: string;
    number_of_nights?: number;
    property_name: string;
    number_of_rooms: number;
    number_of_adults: number;
    number_of_children: number;
    room_details?: RoomDetail[];
    room_arrangements?: string;
    meal_plan?: string;
    special_requests?: string;
    flight_details?: string;
    arrival_time?: string;
    departure_time?: string;
    show_flight_details?: boolean;
    show_special_requests?: boolean;
    status: 'confirmed' | 'cancelled' | 'draft';
    created_at?: string;
    profiles?: {
        full_name: string;
    } | null;
}


export interface TrainReceipt {
    id: string;
    reference_number: string;
    consultant_id: string;
    client_name: string;
    mobile_number?: string;
    train_type: string;
    from_station: string;
    to_station: string;
    departure_date: string;
    departure_time: string;
    arrival_time: string;
    ticket_number?: string;
    
    // Return Journey
    has_return_journey?: boolean;
    return_train_type?: string;
    return_from_station?: string;
    return_to_station?: string;
    return_departure_date?: string;
    return_departure_time?: string;
    return_arrival_time?: string;
    return_ticket_number?: string;
    return_guests?: TrainGuest[];

    guests: TrainGuest[];
    created_at?: string;
    profiles?: {
        full_name: string;
    } | null;
}

export interface TrainGuest {
    name: string;
    coach_no: string;
    seat_no: string;
}
