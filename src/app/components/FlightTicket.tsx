import React, { forwardRef } from 'react';

interface FlightTicketProps {
  passengerName: string;
  flightNumber: string;
  airlineName: string;
  airlineLogo: string; // URL
  departure: string;
  arrival: string;
  date: string;
  time: string;
  trackingNumber: string;
  trip: string;
  tourtype: string;
  passengerclass: string;
}

const FlightTicket = forwardRef<HTMLDivElement, FlightTicketProps>(({
  passengerName,
  flightNumber,
  airlineName,
  airlineLogo,
  departure,
  arrival,
  date,
  time,
  trackingNumber,
  trip,
  tourtype,
  passengerclass,
}, ref) => {
  return (
    <div 
      ref={ref} 
      id="ticket" 
      className="ticket-container"
      style={{ 
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto', 
        backgroundColor: '#ffffff', 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', 
        borderRadius: '12px', 
        padding: '0',
        border: '2px solid #e5e7eb',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        lineHeight: '1.4',
        overflow: 'hidden'
      }}
    >
      {/* Header Section */}
      <div style={{ 
        backgroundColor: '#18176b',
        color: 'white',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img 
            src={airlineLogo} 
            alt="Airline Logo" 
            style={{ 
              height: '50px', 
              width: '50px', 
              objectFit: 'contain',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '5px'
            }} 
            crossOrigin="anonymous"
          />
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
              {airlineName}
            </div>
            <div style={{ fontSize: '14px', opacity: '0.9' }}>
              Flight {flightNumber}
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', opacity: '0.8', marginBottom: '5px' }}>STATUS</div>
          <div style={{ 
            backgroundColor: '#10b981', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            fontSize: '14px', 
            fontWeight: '600' 
          }}>
            CONFIRMED
          </div>
        </div>
      </div>

      {/* Main Ticket Content - Horizontal Layout */}
      <div style={{ padding: '25px' }}>
        {/* Route Information Row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '25px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0'
        }}>
          {/* Departure */}
          <div style={{ textAlign: 'center', flex: '1' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
              From
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '5px' }}>
              {departure}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Departure
            </div>
          </div>
          
          {/* Flight Arrow */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            margin: '0 30px'
          }}>
            <div style={{ fontSize: '24px', color: '#18176b', fontWeight: 'bold', marginBottom: '5px' }}>
              ✈
            </div>
            <div style={{ 
              width: '60px', 
              height: '2px', 
              backgroundColor: '#18176b',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute',
                right: '0',
                top: '-3px',
                width: '0',
                height: '0',
                borderLeft: '8px solid #18176b',
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent'
              }}></div>
            </div>
          </div>
          
          {/* Arrival */}
          <div style={{ textAlign: 'center', flex: '1' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
              To
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '5px' }}>
              {arrival}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Arrival
            </div>
          </div>
        </div>

        {/* Flight Details Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '20px',
          marginBottom: '25px'
        }}>
          {/* Date & Time */}
          <div style={{ 
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
              Date & Time
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', marginBottom: '5px' }}>
              {date}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {time}
            </div>
          </div>

          {/* Passenger Info */}
          <div style={{ 
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
              Passenger
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', marginBottom: '5px' }}>
              {passengerName}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {passengerclass}
            </div>
          </div>

          {/* Trip Details */}
          <div style={{ 
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
              Trip Details
            </div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', marginBottom: '5px' }}>
              {trip}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {tourtype}
            </div>
          </div>
        </div>

        {/* Tracking Information */}
        <div style={{ 
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#0369a1', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
            Booking Reference
          </div>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '18px', 
            color: '#18176b', 
            fontWeight: '700',
            letterSpacing: '2px'
          }}>
            {trackingNumber}
          </div>
          <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '5px' }}>
            Please keep this reference for your records
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        padding: '15px 25px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div style={{ marginBottom: '5px', fontWeight: '600' }}>
          🎫 Aero Link - Your Trusted Travel Partner
        </div>
        <div style={{ fontStyle: 'italic' }}>
          Please present this ticket at check-in • Valid ID required • Terms and conditions apply
        </div>
      </div>
    </div>
  );
});

export default FlightTicket; 