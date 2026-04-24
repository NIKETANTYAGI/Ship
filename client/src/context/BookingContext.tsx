import React, { createContext, useContext, useState, useEffect } from 'react';

interface AddressDetails {
  pincode: string;
  address: string;
  name: string;
  phone: string;
}

interface PackageDetails {
  weight: string;
  length: string;
  width: string;
  height: string;
}

interface BookingState {
  selectedCourier: any | null;
  pickup: AddressDetails;
  delivery: AddressDetails;
  packageDetails: PackageDetails;
  lastAwb: string | null;
}

interface BookingContextType extends BookingState {
  setCourier: (courier: any | null) => void;
  updatePickup: (details: Partial<AddressDetails>) => void;
  updateDelivery: (details: Partial<AddressDetails>) => void;
  updatePackage: (details: Partial<PackageDetails>) => void;
  setLastAwb: (awb: string | null) => void;
  resetBooking: () => void;
  fetchRates: () => Promise<any[]>;
}

const defaultAddress: AddressDetails = {
  pincode: "",
  address: "",
  name: "",
  phone: "",
};

const defaultPackage: PackageDetails = {
  weight: "1.5",
  length: "",
  width: "",
  height: "",
};

const BookingContext = createContext<BookingContextType>({} as BookingContextType);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingState>(() => {
    const saved = localStorage.getItem('booking_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse booking state", e);
      }
    }
    return {
      selectedCourier: null,
      pickup: { ...defaultAddress, pincode: "400001", address: "Flat 4B, Hill View", name: "Rahul Sharma", phone: "98765 43210" },
      delivery: { ...defaultAddress, pincode: "110001" },
      packageDetails: defaultPackage,
      lastAwb: null,
    };
  });

  useEffect(() => {
    localStorage.setItem('booking_state', JSON.stringify(state));
  }, [state]);

  const setCourier = (selectedCourier: any | null) => {
    setState(prev => ({ ...prev, selectedCourier }));
  };

  const updatePickup = (details: Partial<AddressDetails>) => {
    setState(prev => ({ ...prev, pickup: { ...prev.pickup, ...details } }));
  };

  const updateDelivery = (details: Partial<AddressDetails>) => {
    setState(prev => ({ ...prev, delivery: { ...prev.delivery, ...details } }));
  };

  const updatePackage = (details: Partial<PackageDetails>) => {
    setState(prev => ({ ...prev, packageDetails: { ...prev.packageDetails, ...details } }));
  };

  const setLastAwb = (lastAwb: string | null) => {
    setState(prev => ({ ...prev, lastAwb }));
  };

  const resetBooking = () => {
    setState({
      selectedCourier: null,
      pickup: { ...defaultAddress },
      delivery: { ...defaultAddress },
      packageDetails: defaultPackage,
      lastAwb: state.lastAwb, // Keep last AWB even on reset
    });
    localStorage.removeItem('booking_state');
  };

  const fetchRates = async () => {
    // Artificial delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Returning mock rates that match the UI requirements
    return [
      { id: "SRV_01", name: "SwiftAir Priority", price: 85.50, etaDays: "1", actualAvgDays: "1.2", rating: 4.9, recommendation: "FASTEST" },
      { id: "SRV_02", name: "Standard Ground", price: 42.00, etaDays: "4", actualAvgDays: "3.8", rating: 4.7 },
      { id: "SRV_03", name: "HeavyDuty Logistics", price: 120.00, etaDays: "2", actualAvgDays: "2.1", rating: 4.5 },
      { id: "SRV_04", name: "Budget Route", price: 35.00, etaDays: "6", actualAvgDays: "5.5", rating: 4.2 }
    ];
  };

  return (
    <BookingContext.Provider value={{ 
      ...state, 
      setCourier, 
      updatePickup, 
      updateDelivery, 
      updatePackage,
      setLastAwb,
      resetBooking,
      fetchRates
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
