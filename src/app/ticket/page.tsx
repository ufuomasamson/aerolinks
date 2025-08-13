"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase, TABLES } from "@/lib/supabaseClient";
import FlightTicket from "@/app/components/FlightTicket";
import { downloadTicket } from "@/lib/downloadTicket";

export default function TicketPage() {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      
      try {
        // Get user from Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setError("You must be logged in to view your ticket.");
          setLoading(false);
          return;
        }
        
        const userId = session.user.id;
        
        // Use Supabase to fetch booking data with flight and airline information
        const { data: bookings, error: bookingError } = await supabase
          .from(TABLES.BOOKINGS)
          .select(`
            *,
            flights:flight_id (
              id,
              flight_number,
              departure_location_id,
              arrival_location_id,
              date,
              time,
              price,
              trip,
              tour_type,
              passenger_class,
              departure_location:locations!flights_departure_location_id_fkey(city, country),
              arrival_location:locations!flights_arrival_location_id_fkey(city, country),
              airline:airlines(id, name, logo_url)
            )
          `)
          .eq('user_id', userId)
          .eq('paid', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (bookingError || !bookings) {
          throw new Error("No paid booking found");
        }
        
        // Set the booking data
        setBooking(bookings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ticket:", error);
        setError("Failed to load ticket information");
        setLoading(false);
      }
    };
    fetchTicket();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading ticket...</div>;
  }
  if (error) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-600 font-semibold">{error}</div>;
  }
  if (!booking) return null;

  // Format the data for better display
  const formatTrip = (trip: string) => {
    if (!trip) return "One Way";
    return trip.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatTourType = (tourType: string) => {
    if (!tourType) return "Economy";
    return tourType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatPassengerClass = (passengerClass: string) => {
    if (!passengerClass) return "Economy";
    return passengerClass.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8 px-2">
      <FlightTicket
        ref={ticketRef}
        passengerName={booking.passenger_name || "N/A"}
        flightNumber={booking.flights?.flight_number || "N/A"}
        airlineName={booking.flights?.airline?.name || "AERO LINK"}
        departure={booking.flights?.departure_location?.city || "N/A"}
        arrival={booking.flights?.arrival_location?.city || "N/A"}
        date={booking.flights?.date || "N/A"}
        time={booking.flights?.time || "N/A"}
        trackingNumber={booking.tracking_number || booking.id}
        trip={formatTrip(booking.flights?.trip)}
        tourtype={formatTourType(booking.flights?.tour_type)}
        passengerclass={formatPassengerClass(booking.flights?.passenger_class)}
      />
      
      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => downloadTicket(ticketRef)}
          className="px-6 py-2 bg-[#18176b] text-white rounded-lg font-semibold shadow hover:bg-[#1f1e89] transition"
        >
          Download PDF
        </button>
        
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition"
        >
          Print Ticket
        </button>
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-gray-600 max-w-md">
        <p>💡 <strong>Tip:</strong> If PDF download doesn't work properly, use the Print button instead. 
        You can then save as PDF from your browser's print dialog.</p>
      </div>
    </div>
  );
} 