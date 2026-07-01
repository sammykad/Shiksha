export const INDIAN_FIRST_NAMES_MALE = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
  'Rohan', 'Aryan', 'Reyansh', 'Mohammed', 'Dhruv', 'Kabir', 'Shivansh', 'Atharv', 'Karthik', 'Rahul',
  'Vikram', 'Suresh', 'Rajesh', 'Amit', 'Sanjay', 'Pradeep', 'Manoj', 'Deepak', 'Sunil', 'Anil',
  'Ravi', 'Mohan', 'Gopal', 'Krishna', 'Ram', 'Shyam', 'Lakshman', 'Bharat', 'Arvind', 'Nitin',
]

export const INDIAN_FIRST_NAMES_FEMALE = [
  'Aadhya', 'Ananya', 'Aanya', 'Aaradhya', 'Diya', 'Saanvi', 'Kavya', 'Anika', 'Myra', 'Ira',
  'Priya', 'Neha', 'Pooja', 'Ritu', 'Sneha', 'Kavita', 'Meera', 'Shreya', 'Riya', 'Tanya',
  'Lakshmi', 'Saraswati', 'Durga', 'Parvati', 'Radha', 'Sita', 'Gita', 'Uma', 'Jaya', 'Nisha',
  'Anjali', 'Sunita', 'Rekha', 'Sangeeta', 'Vandana', 'Pallavi', 'Swati', 'Madhuri', 'Asha', 'Komal',
]

export const INDIAN_LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Shah', 'Joshi', 'Iyer', 'Nair',
  'Reddy', 'Rao', 'Pillai', 'Mukherjee', 'Chatterjee', 'Banerjee', 'Das', 'Mehta', 'Desai', 'Pandey',
  'Tiwari', 'Dubey', 'Mishra', 'Saxena', 'Agarwal', 'Bansal', 'Goel', 'Tandon', 'Kapoor', 'Malhotra',
  'Chopra', 'Khanna', 'Sethi', 'Bhatia', 'Arora', 'Saini', 'Chauhan', 'Rathore', 'Thakur', 'Yadav',
  'Jadhav', 'Patil', 'Kulkarni', 'Deshmukh', 'Gaikwad', 'Pawar', 'More', 'Bhosale', 'Shinde', 'Gore',
]

export const INDIAN_ADDRESSES = [
  '12, MG Road', '45, Station Road', '78, Gandhi Nagar', '23, Park Street',
  '56, Nehru Place', '89, Ring Road', '34, Civil Lines', '67, Mall Road',
  '90, Lake View', '15, Hill Road', '42, Market Street', '88, Temple Road',
  '21, Shivaji Chowk', '55, Tilak Road', '33, JM Road', '77, FC Road',
  '11, KP Road', '44, SB Road', '66, Law College Road', '99, Kothrud',
]

export const INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', pinCodes: ['400001', '400050', '400060', '400092'] },
  { city: 'Delhi', state: 'Delhi', pinCodes: ['110001', '110025', '110058', '110092'] },
  { city: 'Bangalore', state: 'Karnataka', pinCodes: ['560001', '560037', '560066', '560100'] },
  { city: 'Pune', state: 'Maharashtra', pinCodes: ['411001', '411038', '411057', '411045'] },
  { city: 'Hyderabad', state: 'Telangana', pinCodes: ['500001', '500033', '500081', '500034'] },
  { city: 'Chennai', state: 'Tamil Nadu', pinCodes: ['600001', '600020', '600042', '600096'] },
  { city: 'Kolkata', state: 'West Bengal', pinCodes: ['700001', '700027', '700091', '700156'] },
  { city: 'Ahmedabad', state: 'Gujarat', pinCodes: ['380001', '380006', '380015', '380054'] },
  { city: 'Jaipur', state: 'Rajasthan', pinCodes: ['302001', '302012', '302017', '302020'] },
  { city: 'Lucknow', state: 'Uttar Pradesh', pinCodes: ['226001', '226010', '226016', '226024'] },
]


export const CASTES = ['General', 'OBC', 'SC', 'ST', '']

export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

export function generateIndianPhone(): string {
  const prefixes = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90', '88', '87', '86', '85', '84', '83', '82', '81', '80', '78', '77', '76', '75', '74', '73', '72', '71', '70']
  const prefix = randomItem(prefixes)
  const rest = String(randomInt(10000000, 99999999))
  return `+91${prefix}${rest}`
}

export function generateIndianEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'rediffmail.com', 'outlook.com']
  const name = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now().toString(36)}${randomInt(1, 999)}`
  return `${name}@${randomItem(domains)}`
}

export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 25; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function generatePgArray(arr: string[]): string {
  return `{${arr.map(s => `"${s}"`).join(',')}}`
}


