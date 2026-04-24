export const MOCK_USER = {
  name: "Rahul Sharma",
  phone: "+91 98765 43210", 
  email: "rahul@gmail.com",
  wallet: 200,
  shipments: 24,
  moneySaved: 340,
  referrals: 5,
  kycVerified: false
}

export const MOCK_COURIERS = [
  { id:1, name:"Delhivery", price:89, days:"3-4", actual:"~5 days", 
    rating:4.2, cod:true, tag:"CHEAPEST", logo:"D", color:"#1a1a2e" },
  { id:2, name:"DTDC", price:110, days:"2-3", actual:"~4 days", 
    rating:4.0, cod:true, tag:"RELIABLE", logo:"D", color:"#8b0000" },
  { id:3, name:"XpressBees", price:95, days:"4-5", actual:"~6 days", 
    rating:3.8, cod:true, tag:"", logo:"X", color:"#ff6600" },
  { id:4, name:"Blue Dart", price:145, days:"1-2", actual:"~2 days", 
    rating:4.8, cod:false, tag:"FASTEST", logo:"B", color:"#003087" },
  { id:5, name:"Ecom Express", price:105, days:"3-5", actual:"~5 days", 
    rating:4.1, cod:true, tag:"BEST VALUE", logo:"E", color:"#006400" },
  { id:6, name:"Shadowfax", price:98, days:"3-4", actual:"~4 days", 
    rating:3.9, cod:true, tag:"", logo:"S", color:"#2d2d2d" }
]

export const MOCK_SHIPMENTS = [
  { id: 1, shipment_id: "SR1", awb:"SR2024031500123", from:"DEL", to:"BOM", fromCity:"New Delhi", 
    toCity:"Mumbai", courier:"Delhivery", status:"out_for_delivery", 
    total_paise:11400, created_at:"2024-03-15T10:00:00Z", weight:"1kg", type:"Parcel",
    evidenceVault:true, cod:false },
  { id: 2, shipment_id: "SR2", awb:"SR2024031400089", from:"BLR", to:"HYD", fromCity:"Bangalore", 
    toCity:"Hyderabad", courier:"XpressBees", status:"in_transit", 
    total_paise:8900, created_at:"2024-03-14T10:00:00Z", weight:"500g", type:"Document",
    evidenceVault:false, cod:false },
  { id: 3, shipment_id: "SR3", awb:"SR2024031200045", from:"DEL", to:"PNQ", fromCity:"New Delhi", 
    toCity:"Pune", courier:"Ecom Express", status:"delivered", 
    total_paise:9500, created_at:"2024-03-12T10:00:00Z", weight:"2kg", type:"Parcel",
    evidenceVault:true, cod:true, codAmount:850 },
  { id: 4, shipment_id: "SR4", awb:"SR2024031000007", from:"CCU", to:"DEL", fromCity:"Kolkata", 
    toCity:"New Delhi", courier:"DTDC", status:"cancelled", 
    total_paise:21000, created_at:"2024-03-10T10:00:00Z", weight:"3kg", type:"Parcel",
    evidenceVault:false, cod:false },
  { id: 5, shipment_id: "SR5", awb:"SR2024030800212", from:"BOM", to:"MAA", fromCity:"Mumbai", 
    toCity:"Chennai", courier:"Blue Dart", status:"delivered", 
    total_paise:32000, created_at:"2024-03-08T10:00:00Z", weight:"1.5kg", type:"Fragile",
    evidenceVault:true, cod:false },
  { id: 6, shipment_id: "SR6", awb:"RET-SR992", from:"PNQ", to:"DEL", fromCity:"Pune", 
    toCity:"New Delhi", courier:"Delhivery", status:"return_pending", 
    total_paise:0, created_at:"2024-03-05T10:00:00Z", weight:"1kg", type:"Parcel",
    evidenceVault:false, cod:false }
]

export const MOCK_ADDRESSES = [
  { id: "1", name: "Home", phone: "9876543210", address: "123, Sunrise Apartments, HSR Layout", pincode: "560102", city: "Bangalore", state: "Karnataka", is_default: true },
  { id: "2", name: "Office", phone: "9876543211", address: "Tower A, Tech Park, Whitefield", pincode: "560066", city: "Bangalore", state: "Karnataka", is_default: false }
]

export const MOCK_TRACKING: Record<string, any> = {
  "SR2024031500123": {
    awb: "SR2024031500123",
    current_status: "out_for_delivery",
    courier: "Delhivery",
    official_eta: "2024-03-16T18:00:00Z",
    current_location: "Mumbai South Hub",
    events: [
      { id: 1, status: "completed", location: "Mumbai HUB", description: "Package arrived at Mumbai local hub", timestamp: "2024-03-15T09:00:00Z" },
      { id: 2, status: "active", location: "On the way", description: "Out for delivery - Rahul (9876543210)", timestamp: "2024-03-15T10:30:00Z" },
      { id: 3, status: "pending", location: "Destination", description: "Delivered to recipient", timestamp: "" }
    ]
  },
  "SR2024031400089": {
    awb: "SR2024031400089",
    current_status: "in_transit",
    courier: "XpressBees",
    official_eta: "2024-03-17T18:00:00Z",
    current_location: "Hyderabad Gateway",
    events: [
      { id: 1, status: "completed", location: "Bangalore", description: "Pickup scheduled", timestamp: "2024-03-14T10:00:00Z" },
      { id: 2, status: "completed", location: "Bangalore HUB", description: "In transit to Hyderabad", timestamp: "2024-03-14T18:00:00Z" },
      { id: 3, status: "active", location: "Transit", description: "Arrived at Hyderabad sorting center", timestamp: "2024-03-15T04:00:00Z" }
    ]
  }
};
