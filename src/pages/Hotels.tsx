import React from 'react';

export default function Hotels() {
    return (
        <div className="h-full w-full bg-white">
            <iframe 
                src="https://www.hhtravel.co/travel-packages" 
                className="w-full h-full border-none"
                title="H&H Travel Packages"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}
