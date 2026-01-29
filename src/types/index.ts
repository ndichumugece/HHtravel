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
    mode_of_transport?: string;
    status: 'issued' | 'cancelled';
    created_at: string;
    room_details?: RoomDetail[];
    profiles?: {
        full_name: string;
    };
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
    reference_number: string;
    consultant_id: string;
    client_name: string;
    package_type?: string;
    booking_status: 'Tentative' | 'Confirmed';
    check_in_date?: string;
    check_out_date?: string;
    number_of_nights?: number;
    number_of_guests?: string;
    number_of_rooms?: number;
    hotel_comparison?: HotelComparison[];
    includes_list?: string[];
    meal_plan_explanation?: string;
    terms_and_conditions?: string;
    created_at: string;
}

export interface HotelComparison {
    property_name: string;
    meal_plan: string;
    single_price: string;
    double_price: string;
}

export interface CompanySettings {
    id: string;
    company_name: string;
    company_email?: string;
    company_address?: string;
    company_website?: string;
    logo_url?: string;
    pdf_footer_text?: string;
}

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'consultant';
    created_at: string;
}

