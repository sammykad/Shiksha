/**
 * Location Pages Configuration
 * Top 10 Indian cities for local SEO targeting
 */

export interface LocationConfig {
  slug: string;
  name: string;
  areaServed: string;
  landmarks: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export const LOCATION_PAGES: LocationConfig[] = [
  {
    slug: 'india',
    name: 'India',
    areaServed: 'Pan India — Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad',
    landmarks: ['CBSE', 'ICSE', 'State Boards', 'IGCSE', 'IB Schools'],
    coordinates: { latitude: 20.5937, longitude: 78.9629 },
  },
  {
    slug: 'pune',
    name: 'Pune',
    areaServed: 'Pune, Pimpri-Chinchwad, Hinjewadi, Wakad, Baner, Aundh, Kothrud, Deccan',
    landmarks: ['Symbiosis Institute', 'MIT Pune', 'Modern College', 'FC Road', 'JM Road', 'MG Road', 'Koregaon Park', 'Viman Nagar'],
    coordinates: { latitude: 18.5204, longitude: 73.8567 },
  },
  {
    slug: 'mumbai',
    name: 'Mumbai',
    areaServed: 'Mumbai, Navi Mumbai, Thane, Kalyan, Vasai-Virar, Mira-Bhayandar',
    landmarks: ['University of Mumbai', 'IIT Bombay', 'NMIMS', 'Andheri', 'Bandra', 'Powai', 'Borivali'],
    coordinates: { latitude: 19.076, longitude: 72.8777 },
  },
  {
    slug: 'delhi',
    name: 'Delhi',
    areaServed: 'Delhi, NCR, Gurgaon, Noida, Faridabad, Ghaziabad, Dwarka',
    landmarks: ['Delhi University', 'IIT Delhi', 'Connaught Place', 'Dwarka', 'Rohini', 'Janakpuri'],
    coordinates: { latitude: 28.7041, longitude: 77.1025 },
  },
  {
    slug: 'bangalore',
    name: 'Bangalore',
    areaServed: 'Bangalore, Whitefield, Electronic City, Koramangala, Indiranagar, Jayanagar',
    landmarks: ['IISc Bangalore', 'IIM Bangalore', 'MG Road', 'Whitefield IT Hub', 'HSR Layout', 'Malleshwaram'],
    coordinates: { latitude: 12.9716, longitude: 77.5946 },
  },
  {
    slug: 'hyderabad',
    name: 'Hyderabad',
    areaServed: 'Hyderabad, Gachibowli, Madhapur, Secunderabad, Kukatpally, LB Nagar',
    landmarks: ['IIIT Hyderabad', 'ISB Hyderabad', 'HITEC City', 'Charminar', 'Banjara Hills', 'Jubilee Hills'],
    coordinates: { latitude: 17.385, longitude: 78.4867 },
  },
  {
    slug: 'chennai',
    name: 'Chennai',
    areaServed: 'Chennai, T Nagar, Anna Nagar, Adyar, Velachery, Tambaram',
    landmarks: ['IIT Madras', 'Anna University', 'T Nagar', 'Marina Beach', 'Nungambakkam', 'Mylapore'],
    coordinates: { latitude: 13.0827, longitude: 80.2707 },
  },
  {
    slug: 'kolkata',
    name: 'Kolkata',
    areaServed: 'Kolkata, Howrah, Salt Lake, New Town, Dum Dum, Jadavpur',
    landmarks: ['Presidency University', 'IIM Calcutta', 'Park Street', 'Salt Lake', 'Ballygunge', 'New Alipore'],
    coordinates: { latitude: 22.5726, longitude: 88.3639 },
  },
  {
    slug: 'ahmedabad',
    name: 'Ahmedabad',
    areaServed: 'Ahmedabad, Gandhinagar, GIFT City, Satellite, Vastrapur, Bodakdev',
    landmarks: ['IIM Ahmedabad', 'Gujarat University', 'SG Highway', 'Maninagar', 'Navrangpura'],
    coordinates: { latitude: 23.0225, longitude: 72.5714 },
  },
  {
    slug: 'jaipur',
    name: 'Jaipur',
    areaServed: 'Jaipur, Malviya Nagar, Vaishali Nagar, Tonk Road, Civil Lines',
    landmarks: ['University of Rajasthan', 'MNIT Jaipur', 'Pink City', 'Malviya Nagar', 'C-Scheme'],
    coordinates: { latitude: 26.9124, longitude: 75.7873 },
  },
  {
    slug: 'lucknow',
    name: 'Lucknow',
    areaServed: 'Lucknow, Gomti Nagar, Aliganj, Indira Nagar, Hazratganj',
    landmarks: ['Lucknow University', 'IIM Lucknow', 'Hazratganj', 'Gomti Nagar', 'Alambagh'],
    coordinates: { latitude: 26.8467, longitude: 80.9462 },
  },
  {
    slug: 'nagpur',
    name: 'Nagpur',
    areaServed: 'Nagpur, Amravati, Wardha, Yavatmal, Chandrapur',
    landmarks: ['VNIT Nagpur', 'Nagpur University', 'Sitabuldi', 'Dharampeth', 'Ramdaspeth'],
    coordinates: { latitude: 21.1458, longitude: 79.0882 },
  },
  {
    slug: 'indore',
    name: 'Indore',
    areaServed: 'Indore, Bhopal, Ujjain, Dewas, Pithampur',
    landmarks: ['IIM Indore', 'IIT Indore', 'Vijay Nagar', 'Palasia', 'AB Road'],
    coordinates: { latitude: 22.7196, longitude: 75.8577 },
  },
  {
    slug: 'bhopal',
    name: 'Bhopal',
    areaServed: 'Bhopal, Indore, Jabalpur, Gwalior, Sagar',
    landmarks: ['MANIT Bhopal', 'Barkatullah University', 'MP Nagar', 'Arera Colony', 'Kolar Road'],
    coordinates: { latitude: 23.2599, longitude: 77.4126 },
  },
  {
    slug: 'surat',
    name: 'Surat',
    areaServed: 'Surat, Vadodara, Bharuch, Ankleshwar, Navsari',
    landmarks: ['SVNIT Surat', 'Veer Narmad South Gujarat University', 'Adajan', 'Vesu', 'Athwa'],
    coordinates: { latitude: 21.1702, longitude: 72.8311 },
  },
  {
    slug: 'vadodara',
    name: 'Vadodara',
    areaServed: 'Vadodara, Anand, Bharuch, Gandhinagar, Kheda',
    landmarks: ['MS University Vadodara', 'IIMA Vadodara', 'Alkapuri', 'Fatehgunj', 'Akota'],
    coordinates: { latitude: 22.3072, longitude: 73.1812 },
  },
  {
    slug: 'kochi',
    name: 'Kochi',
    areaServed: 'Kochi, Thiruvananthapuram, Kozhikode, Thrissur, Ernakulam',
    landmarks: ['CUSAT', 'IIM Kozhikode', 'Marine Drive', 'Kakkanad', 'Edapally'],
    coordinates: { latitude: 9.9312, longitude: 76.2673 },
  },
  {
    slug: 'chandigarh',
    name: 'Chandigarh',
    areaServed: 'Chandigarh, Mohali, Panchkula, Zirakpur, Derabassi',
    landmarks: ['PU Chandigarh', 'PEC University', 'Sector 17', 'Sector 35', 'IT Park Mohali'],
    coordinates: { latitude: 30.7333, longitude: 76.7794 },
  },
  {
    slug: 'visakhapatnam',
    name: 'Visakhapatnam',
    areaServed: 'Visakhapatnam, Vijayawada, Rajahmundry, Kakinada, Guntur',
    landmarks: ['GITAM University', 'Andhra University', 'Steel Plant Area', 'Gajuwaka', 'MVP Colony'],
    coordinates: { latitude: 17.6868, longitude: 83.2185 },
  },
  {
    slug: 'coimbatore',
    name: 'Coimbatore',
    areaServed: 'Coimbatore, Madurai, Salem, Tiruchirappalli, Erode',
    landmarks: ['PSG College', 'Amrita University', 'RS Puram', 'Gandhipuram', 'Peelamedu'],
    coordinates: { latitude: 11.0168, longitude: 76.9558 },
  },
  {
    slug: 'patna',
    name: 'Patna',
    areaServed: 'Patna, Gaya, Muzaffarpur, Bhagalpur, Darbhanga',
    landmarks: ['Patna University', 'NIT Patna', 'Bailey Road', 'Boring Road', 'Kankarbagh'],
    coordinates: { latitude: 25.5941, longitude: 85.1376 },
  },
];

/**
 * Generate all location page paths for static generation
 */
export function generateLocationPaths() {
  return LOCATION_PAGES.map((location) => ({
    location: location.slug,
  }));
}
/**
 * Get location config by slug
 */
export function getLocationBySlug(slug: string): LocationConfig | undefined {
  return LOCATION_PAGES.find((loc) => loc.slug === slug);
}
