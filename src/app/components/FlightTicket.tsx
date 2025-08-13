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
        display: 'flex',
        backgroundColor: '#0052b3',
        color: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        width: '1100px',
        maxWidth: '100%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        fontFamily: 'Arial, sans-serif',
        margin: '0 auto'
      }}
    >
      {/* Left Section - Main Ticket */}
      <div style={{ 
        flex: '3',
        padding: '30px 40px',
        position: 'relative'
      }}>
        <h4 style={{ 
          fontSize: '16px', 
          margin: '0', 
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {passengerclass.toUpperCase()} CLASS
        </h4>
        
        <h2 style={{ 
          fontSize: '36px', 
          margin: '10px 0', 
          fontWeight: 'bold', 
          color: '#ffcc00' 
        }}>
          {airlineName.toUpperCase()}
        </h2>
        
        <p style={{ margin: '0', fontSize: '18px' }}>
          Safe skies with us!
        </p>

        {/* Clouds */}
        <svg style={{
          position: 'absolute',
          top: '30px',
          left: '20px',
          width: '100px',
          opacity: '0.6'
        }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="#4680d1">
          <ellipse cx="16" cy="16" rx="16" ry="10"/>
          <ellipse cx="40" cy="16" rx="14" ry="10"/>
          <ellipse cx="28" cy="12" rx="12" ry="8"/>
        </svg>
        
        <svg style={{
          position: 'absolute',
          bottom: '40px',
          right: '200px',
          width: '120px',
          opacity: '0.6'
        }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="#4680d1">
          <ellipse cx="16" cy="16" rx="16" ry="10"/>
          <ellipse cx="40" cy="16" rx="14" ry="10"/>
          <ellipse cx="28" cy="12" rx="12" ry="8"/>
        </svg>
        
        <svg style={{
          position: 'absolute',
          top: '120px',
          right: '40px',
          width: '80px',
          opacity: '0.6'
        }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="#4680d1">
          <ellipse cx="16" cy="16" rx="16" ry="10"/>
          <ellipse cx="40" cy="16" rx="14" ry="10"/>
          <ellipse cx="28" cy="12" rx="12" ry="8"/>
        </svg>

        {/* Airplane */}
        <svg style={{
          position: 'absolute',
          top: '60px',
          right: '150px',
          width: '80px'
        }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32">
          <path d="M2 16 L20 20 L50 10 L60 14 L50 18 L20 12 Z" fill="#fff"/>
          <rect x="48" y="10" width="4" height="8" fill="#ff3333"/>
          <rect x="12" y="14" width="4" height="8" fill="#ff3333"/>
          <circle cx="26" cy="14" r="1" fill="#666"/>
          <circle cx="30" cy="13" r="1" fill="#666"/>
          <circle cx="34" cy="12" r="1" fill="#666"/>
        </svg>

        {/* Flight Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '25px',
          marginTop: '40px'
        }}>
          <div style={{ fontSize: '14px', textTransform: 'uppercase', color: '#d6e4ff' }}>
            PASSENGER NAME
            <span style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', color: 'white', marginTop: '5px' }}>
              {passengerName}
            </span>
          </div>
          
          <div style={{ fontSize: '14px', textTransform: 'uppercase', color: '#d6e4ff' }}>
            DEPARTURE TIME
            <span style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', color: 'white', marginTop: '5px' }}>
              {time}
            </span>
          </div>
          
          <div style={{ fontSize: '14px', textTransform: 'uppercase', color: '#d6e4ff' }}>
            SEAT NUMBER
            <span style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', color: 'white', marginTop: '5px' }}>
              {passengerclass.charAt(0).toUpperCase()}26
            </span>
          </div>
          
          <div style={{ fontSize: '14px', textTransform: 'uppercase', color: '#d6e4ff' }}>
            FLIGHT NUMBER
            <span style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', color: 'white', marginTop: '5px' }}>
              {flightNumber}
            </span>
          </div>
          
          <div style={{ fontSize: '14px', textTransform: 'uppercase', color: '#d6e4ff' }}>
            GOING FROM
            <span style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', color: 'white', marginTop: '5px' }}>
              {departure.toUpperCase()}
            </span>
          </div>
          
          <div style={{ fontSize: '14px', textTransform: 'uppercase', color: '#d6e4ff' }}>
            GOING TO
            <span style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', color: 'white', marginTop: '5px' }}>
              {arrival.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section - Stub */}
      <div style={{
        flex: '1.2',
        backgroundColor: '#003a80',
        padding: '30px',
        borderLeft: '2px dashed #ffffff'
      }}>
        <h3 style={{ fontSize: '12px', margin: '10px 0 2px', textTransform: 'uppercase', color: '#d6e4ff' }}>
          PASSENGER NAME
        </h3>
        <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
          {passengerName}
        </p>
        
        <h3 style={{ fontSize: '12px', margin: '10px 0 2px', textTransform: 'uppercase', color: '#d6e4ff' }}>
          DEPARTURE TIME
        </h3>
        <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
          {time}
        </p>
        
        <h3 style={{ fontSize: '12px', margin: '10px 0 2px', textTransform: 'uppercase', color: '#d6e4ff' }}>
          FLIGHT NUMBER
        </h3>
        <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
          {flightNumber}
        </p>
        
        <h3 style={{ fontSize: '12px', margin: '10px 0 2px', textTransform: 'uppercase', color: '#d6e4ff' }}>
          {passengerclass.toUpperCase()} CLASS
        </h3>
        
        {/* Barcode */}
        <div style={{
          marginTop: '30px',
          background: 'repeating-linear-gradient(90deg, black, black 2px, white 2px, white 4px)',
          height: '60px',
          width: '100%'
        }}></div>
      </div>
    </div>
  );
});

export default FlightTicket; 