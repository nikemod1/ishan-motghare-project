export type StateRegion = 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast';

export interface StateProfile {
  id: string;
  mapId: string;
  name: string;
  capital: string;
  region: StateRegion;
  keywords: string[];
}

function toMapId(name: string): string {
  const parts = name
    .replace(/[^a-zA-Z ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function normalizeLookupKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export const stateProfiles: StateProfile[] = [
  { id: 'AP', mapId: toMapId('Andhra Pradesh'), name: 'Andhra Pradesh', capital: 'Amaravati', region: 'South', keywords: ['Vijayawada', 'Visakhapatnam', 'Tirupati'] },
  { id: 'AR', mapId: toMapId('Arunachal Pradesh'), name: 'Arunachal Pradesh', capital: 'Itanagar', region: 'Northeast', keywords: ['Naharlagun', 'Tawang', 'Pasighat'] },
  { id: 'AS', mapId: toMapId('Assam'), name: 'Assam', capital: 'Dispur', region: 'Northeast', keywords: ['Guwahati', 'Silchar', 'Dibrugarh'] },
  { id: 'BR', mapId: toMapId('Bihar'), name: 'Bihar', capital: 'Patna', region: 'East', keywords: ['Gaya', 'Muzaffarpur', 'Bhagalpur'] },
  { id: 'CG', mapId: toMapId('Chhattisgarh'), name: 'Chhattisgarh', capital: 'Raipur', region: 'Central', keywords: ['Bhilai', 'Bilaspur', 'Korba'] },
  { id: 'GA', mapId: toMapId('Goa'), name: 'Goa', capital: 'Panaji', region: 'West', keywords: ['Vasco da Gama', 'Margao', 'Mapusa'] },
  { id: 'GJ', mapId: toMapId('Gujarat'), name: 'Gujarat', capital: 'Gandhinagar', region: 'West', keywords: ['Ahmedabad', 'Surat', 'Vadodara'] },
  { id: 'HR', mapId: toMapId('Haryana'), name: 'Haryana', capital: 'Chandigarh', region: 'North', keywords: ['Gurugram', 'Faridabad', 'Panipat'] },
  { id: 'HP', mapId: toMapId('Himachal Pradesh'), name: 'Himachal Pradesh', capital: 'Shimla', region: 'North', keywords: ['Manali', 'Dharamshala', 'Mandi'] },
  { id: 'JH', mapId: toMapId('Jharkhand'), name: 'Jharkhand', capital: 'Ranchi', region: 'East', keywords: ['Jamshedpur', 'Dhanbad', 'Bokaro'] },
  { id: 'KA', mapId: toMapId('Karnataka'), name: 'Karnataka', capital: 'Bengaluru', region: 'South', keywords: ['Mysuru', 'Mangaluru', 'Hubballi'] },
  { id: 'KL', mapId: toMapId('Kerala'), name: 'Kerala', capital: 'Thiruvananthapuram', region: 'South', keywords: ['Kochi', 'Kozhikode', 'Thrissur'] },
  { id: 'MP', mapId: toMapId('Madhya Pradesh'), name: 'Madhya Pradesh', capital: 'Bhopal', region: 'Central', keywords: ['Indore', 'Gwalior', 'Jabalpur'] },
  { id: 'MH', mapId: toMapId('Maharashtra'), name: 'Maharashtra', capital: 'Mumbai', region: 'West', keywords: ['Pune', 'Nagpur', 'Nashik'] },
  { id: 'MN', mapId: toMapId('Manipur'), name: 'Manipur', capital: 'Imphal', region: 'Northeast', keywords: ['Thoubal', 'Bishnupur', 'Churachandpur'] },
  { id: 'ML', mapId: toMapId('Meghalaya'), name: 'Meghalaya', capital: 'Shillong', region: 'Northeast', keywords: ['Tura', 'Jowai', 'Nongpoh'] },
  { id: 'MZ', mapId: toMapId('Mizoram'), name: 'Mizoram', capital: 'Aizawl', region: 'Northeast', keywords: ['Lunglei', 'Champhai', 'Serchhip'] },
  { id: 'NL', mapId: toMapId('Nagaland'), name: 'Nagaland', capital: 'Kohima', region: 'Northeast', keywords: ['Dimapur', 'Mokokchung', 'Tuensang'] },
  { id: 'OD', mapId: toMapId('Odisha'), name: 'Odisha', capital: 'Bhubaneswar', region: 'East', keywords: ['Cuttack', 'Rourkela', 'Puri'] },
  { id: 'PB', mapId: toMapId('Punjab'), name: 'Punjab', capital: 'Chandigarh', region: 'North', keywords: ['Ludhiana', 'Amritsar', 'Jalandhar'] },
  { id: 'RJ', mapId: toMapId('Rajasthan'), name: 'Rajasthan', capital: 'Jaipur', region: 'North', keywords: ['Jodhpur', 'Udaipur', 'Kota'] },
  { id: 'SK', mapId: toMapId('Sikkim'), name: 'Sikkim', capital: 'Gangtok', region: 'Northeast', keywords: ['Namchi', 'Gyalshing', 'Mangan'] },
  { id: 'TN', mapId: toMapId('Tamil Nadu'), name: 'Tamil Nadu', capital: 'Chennai', region: 'South', keywords: ['Coimbatore', 'Madurai', 'Tiruchirappalli'] },
  { id: 'TS', mapId: toMapId('Telangana'), name: 'Telangana', capital: 'Hyderabad', region: 'South', keywords: ['Warangal', 'Nizamabad', 'Karimnagar'] },
  { id: 'TR', mapId: toMapId('Tripura'), name: 'Tripura', capital: 'Agartala', region: 'Northeast', keywords: ['Udaipur', 'Dharmanagar', 'Kailasahar'] },
  { id: 'UP', mapId: toMapId('Uttar Pradesh'), name: 'Uttar Pradesh', capital: 'Lucknow', region: 'North', keywords: ['Kanpur', 'Varanasi', 'Prayagraj'] },
  { id: 'UK', mapId: toMapId('Uttarakhand'), name: 'Uttarakhand', capital: 'Dehradun', region: 'North', keywords: ['Haridwar', 'Rishikesh', 'Haldwani'] },
  { id: 'WB', mapId: toMapId('West Bengal'), name: 'West Bengal', capital: 'Kolkata', region: 'East', keywords: ['Howrah', 'Siliguri', 'Durgapur'] },
  // SVG uses `andaman_and_nicobar` id for the islands path — use explicit mapId to match the SVG.
  { id: 'AN', mapId: 'andaman_and_nicobar', name: 'Andaman and Nicobar Islands', capital: 'Port Blair', region: 'East', keywords: ['Port Blair', 'Neil Island', 'Havelock'] },
  // Lakshadweep is represented as a small unnamed/UT path in the SVG (ut_unknown2). Map to that id so it is selectable.
  { id: 'LD', mapId: 'ut_unknown2', name: 'Lakshadweep', capital: 'Kavaratti', region: 'South', keywords: ['Kavaratti', 'Agatti', 'Minicoy'] },
];

const stateById = new Map(stateProfiles.map((profile) => [profile.id, profile]));
const stateByName = new Map(stateProfiles.map((profile) => [profile.name.toLowerCase(), profile]));
const stateByMapId = new Map(stateProfiles.map((profile) => [profile.mapId, profile]));
const stateByNormalizedKey = new Map(
  stateProfiles.flatMap((profile) => [
    [normalizeLookupKey(profile.id), profile],
    [normalizeLookupKey(profile.name), profile],
    [normalizeLookupKey(profile.mapId), profile],
  ]),
);

export function getStateProfile(idOrName: string | undefined): StateProfile | undefined {
  if (!idOrName) {
    return undefined;
  }

  const normalized = idOrName.trim().toLowerCase();
  return (
    stateById.get(normalized.toUpperCase()) ??
    stateByName.get(normalized) ??
    stateByMapId.get(idOrName.trim()) ??
    stateByNormalizedKey.get(normalizeLookupKey(idOrName))
  );
}

export function buildSearchTerms(profile: StateProfile): string[] {
  return Array.from(new Set([profile.name, profile.capital, ...profile.keywords])).slice(0, 5);
}
