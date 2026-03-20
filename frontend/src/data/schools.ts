// Indian States, Districts, and Schools Data

export interface School {
  id: string;
  name: string;
  type: 'Government' | 'Private' | 'Aided';
  address?: string;
}

export interface District {
  id: string;
  name: string;
  schools: School[];
}

export interface State {
  id: string;
  name: string;
  code: string;
  districts: District[];
}

export const INDIAN_STATES_SCHOOLS: State[] = [
  {
    id: 'DL',
    name: 'Delhi',
    code: 'DL',
    districts: [
      {
        id: 'central',
        name: 'Central Delhi',
        schools: [
          { id: 'dps-cp', name: 'Delhi Public School, Connaught Place', type: 'Private' },
          { id: 'kv-cp', name: 'Kendriya Vidyalaya, Connaught Place', type: 'Government' },
          { id: 'dav-cp', name: 'DAV Public School, Connaught Place', type: 'Aided' },
          { id: 'sps-cp', name: 'Sarvodaya Bal Vidyalaya', type: 'Government' },
        ],
      },
      {
        id: 'south',
        name: 'South Delhi',
        schools: [
          { id: 'dps-rkp', name: 'Delhi Public School, RK Puram', type: 'Private' },
          { id: 'kv-rkp', name: 'Kendriya Vidyalaya, RK Puram', type: 'Government' },
          { id: 'dav-rkp', name: 'DAV Public School, Vasant Vihar', type: 'Aided' },
          { id: 'aps-sd', name: 'Army Public School, Dhaula Kuan', type: 'Private' },
          { id: 'msb-sd', name: 'Modern School, Barakhamba Road', type: 'Private' },
        ],
      },
      {
        id: 'north',
        name: 'North Delhi',
        schools: [
          { id: 'dps-nd', name: 'Delhi Public School, Rohini', type: 'Private' },
          { id: 'kv-nd', name: 'Kendriya Vidyalaya, Ashok Vihar', type: 'Government' },
          { id: 'dav-nd', name: 'DAV Public School, Rohini', type: 'Aided' },
          { id: 'sbv-nd', name: 'Sarvodaya Vidyalaya, Model Town', type: 'Government' },
        ],
      },
      {
        id: 'east',
        name: 'East Delhi',
        schools: [
          { id: 'dps-ed', name: 'Delhi Public School, Preet Vihar', type: 'Private' },
          { id: 'kv-ed', name: 'Kendriya Vidyalaya, Mayur Vihar', type: 'Government' },
          { id: 'dav-ed', name: 'DAV Public School, Preet Vihar', type: 'Aided' },
        ],
      },
      {
        id: 'west',
        name: 'West Delhi',
        schools: [
          { id: 'dps-wd', name: 'Delhi Public School, Dwarka', type: 'Private' },
          { id: 'kv-wd', name: 'Kendriya Vidyalaya, Janakpuri', type: 'Government' },
          { id: 'dav-wd', name: 'DAV Public School, Paschim Vihar', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'MH',
    name: 'Maharashtra',
    code: 'MH',
    districts: [
      {
        id: 'mumbai',
        name: 'Mumbai',
        schools: [
          { id: 'dps-mum', name: 'Delhi Public School, Mumbai', type: 'Private' },
          { id: 'kv-mum', name: 'Kendriya Vidyalaya, Colaba', type: 'Government' },
          { id: 'dav-mum', name: 'DAV Public School, Andheri', type: 'Aided' },
          { id: 'dhiru-mum', name: 'Dhirubhai Ambani International School', type: 'Private' },
          { id: 'jbcn-mum', name: 'JBCN International School', type: 'Private' },
        ],
      },
      {
        id: 'pune',
        name: 'Pune',
        schools: [
          { id: 'dps-pune', name: 'Delhi Public School, Pune', type: 'Private' },
          { id: 'kv-pune', name: 'Kendriya Vidyalaya, Pune Cantt', type: 'Government' },
          { id: 'dav-pune', name: 'DAV Public School, Pune', type: 'Aided' },
          { id: 'bis-pune', name: 'Bishops School, Pune', type: 'Private' },
        ],
      },
      {
        id: 'nagpur',
        name: 'Nagpur',
        schools: [
          { id: 'dps-ngp', name: 'Delhi Public School, Nagpur', type: 'Private' },
          { id: 'kv-ngp', name: 'Kendriya Vidyalaya, Nagpur', type: 'Government' },
          { id: 'dav-ngp', name: 'DAV Public School, Nagpur', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'KA',
    name: 'Karnataka',
    code: 'KA',
    districts: [
      {
        id: 'bangalore',
        name: 'Bangalore Urban',
        schools: [
          { id: 'dps-blr', name: 'Delhi Public School, Bangalore', type: 'Private' },
          { id: 'kv-blr', name: 'Kendriya Vidyalaya, Malleswaram', type: 'Government' },
          { id: 'dav-blr', name: 'DAV Public School, Bangalore', type: 'Aided' },
          { id: 'nps-blr', name: 'National Public School, Bangalore', type: 'Private' },
          { id: 'bishop-blr', name: 'Bishop Cotton Boys School', type: 'Private' },
        ],
      },
      {
        id: 'mysore',
        name: 'Mysore',
        schools: [
          { id: 'dps-mys', name: 'Delhi Public School, Mysore', type: 'Private' },
          { id: 'kv-mys', name: 'Kendriya Vidyalaya, Mysore', type: 'Government' },
          { id: 'dav-mys', name: 'DAV Public School, Mysore', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'TN',
    name: 'Tamil Nadu',
    code: 'TN',
    districts: [
      {
        id: 'chennai',
        name: 'Chennai',
        schools: [
          { id: 'dps-chn', name: 'Delhi Public School, Chennai', type: 'Private' },
          { id: 'kv-chn', name: 'Kendriya Vidyalaya, Ashok Nagar', type: 'Government' },
          { id: 'dav-chn', name: 'DAV Public School, Chennai', type: 'Aided' },
          { id: 'psbb-chn', name: 'PSBB School, Chennai', type: 'Private' },
          { id: 'chettinad-chn', name: 'Chettinad Vidyashram', type: 'Private' },
        ],
      },
      {
        id: 'coimbatore',
        name: 'Coimbatore',
        schools: [
          { id: 'dps-cbe', name: 'Delhi Public School, Coimbatore', type: 'Private' },
          { id: 'kv-cbe', name: 'Kendriya Vidyalaya, Coimbatore', type: 'Government' },
          { id: 'dav-cbe', name: 'DAV Public School, Coimbatore', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'UP',
    name: 'Uttar Pradesh',
    code: 'UP',
    districts: [
      {
        id: 'lucknow',
        name: 'Lucknow',
        schools: [
          { id: 'dps-lko', name: 'Delhi Public School, Lucknow', type: 'Private' },
          { id: 'kv-lko', name: 'Kendriya Vidyalaya, Gomti Nagar', type: 'Government' },
          { id: 'dav-lko', name: 'DAV Public School, Lucknow', type: 'Aided' },
          { id: 'cms-lko', name: 'City Montessori School', type: 'Private' },
        ],
      },
      {
        id: 'noida',
        name: 'Gautam Buddha Nagar (Noida)',
        schools: [
          { id: 'dps-noida', name: 'Delhi Public School, Noida', type: 'Private' },
          { id: 'kv-noida', name: 'Kendriya Vidyalaya, Noida', type: 'Government' },
          { id: 'dav-noida', name: 'DAV Public School, Noida', type: 'Aided' },
          { id: 'aps-noida', name: 'Amity International School', type: 'Private' },
        ],
      },
      {
        id: 'ghaziabad',
        name: 'Ghaziabad',
        schools: [
          { id: 'dps-gzb', name: 'Delhi Public School, Ghaziabad', type: 'Private' },
          { id: 'kv-gzb', name: 'Kendriya Vidyalaya, Ghaziabad', type: 'Government' },
          { id: 'dav-gzb', name: 'DAV Public School, Ghaziabad', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'GJ',
    name: 'Gujarat',
    code: 'GJ',
    districts: [
      {
        id: 'ahmedabad',
        name: 'Ahmedabad',
        schools: [
          { id: 'dps-amd', name: 'Delhi Public School, Ahmedabad', type: 'Private' },
          { id: 'kv-amd', name: 'Kendriya Vidyalaya, Ahmedabad', type: 'Government' },
          { id: 'dav-amd', name: 'DAV Public School, Ahmedabad', type: 'Aided' },
          { id: 'zydus-amd', name: 'Zydus School for Excellence', type: 'Private' },
        ],
      },
      {
        id: 'surat',
        name: 'Surat',
        schools: [
          { id: 'dps-srt', name: 'Delhi Public School, Surat', type: 'Private' },
          { id: 'kv-srt', name: 'Kendriya Vidyalaya, Surat', type: 'Government' },
          { id: 'dav-srt', name: 'DAV Public School, Surat', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'RJ',
    name: 'Rajasthan',
    code: 'RJ',
    districts: [
      {
        id: 'jaipur',
        name: 'Jaipur',
        schools: [
          { id: 'dps-jpr', name: 'Delhi Public School, Jaipur', type: 'Private' },
          { id: 'kv-jpr', name: 'Kendriya Vidyalaya, Jaipur', type: 'Government' },
          { id: 'dav-jpr', name: 'DAV Public School, Jaipur', type: 'Aided' },
          { id: 'mps-jpr', name: 'Maharani Gayatri Devi School', type: 'Private' },
        ],
      },
      {
        id: 'jodhpur',
        name: 'Jodhpur',
        schools: [
          { id: 'dps-jdh', name: 'Delhi Public School, Jodhpur', type: 'Private' },
          { id: 'kv-jdh', name: 'Kendriya Vidyalaya, Jodhpur', type: 'Government' },
          { id: 'dav-jdh', name: 'DAV Public School, Jodhpur', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'WB',
    name: 'West Bengal',
    code: 'WB',
    districts: [
      {
        id: 'kolkata',
        name: 'Kolkata',
        schools: [
          { id: 'dps-kol', name: 'Delhi Public School, Kolkata', type: 'Private' },
          { id: 'kv-kol', name: 'Kendriya Vidyalaya, Salt Lake', type: 'Government' },
          { id: 'dav-kol', name: 'DAV Public School, Kolkata', type: 'Aided' },
          { id: 'lmgs-kol', name: 'La Martiniere for Girls', type: 'Private' },
          { id: 'sxc-kol', name: 'St. Xavier\'s Collegiate School', type: 'Private' },
        ],
      },
    ],
  },
  {
    id: 'HR',
    name: 'Haryana',
    code: 'HR',
    districts: [
      {
        id: 'gurgaon',
        name: 'Gurugram',
        schools: [
          { id: 'dps-ggn', name: 'Delhi Public School, Gurugram', type: 'Private' },
          { id: 'kv-ggn', name: 'Kendriya Vidyalaya, Gurugram', type: 'Government' },
          { id: 'dav-ggn', name: 'DAV Public School, Gurugram', type: 'Aided' },
          { id: 'ggs-ggn', name: 'GD Goenka School', type: 'Private' },
        ],
      },
      {
        id: 'faridabad',
        name: 'Faridabad',
        schools: [
          { id: 'dps-fbd', name: 'Delhi Public School, Faridabad', type: 'Private' },
          { id: 'kv-fbd', name: 'Kendriya Vidyalaya, Faridabad', type: 'Government' },
          { id: 'dav-fbd', name: 'DAV Public School, Faridabad', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'PB',
    name: 'Punjab',
    code: 'PB',
    districts: [
      {
        id: 'chandigarh',
        name: 'Chandigarh',
        schools: [
          { id: 'dps-chd', name: 'Delhi Public School, Chandigarh', type: 'Private' },
          { id: 'kv-chd', name: 'Kendriya Vidyalaya, Chandigarh', type: 'Government' },
          { id: 'dav-chd', name: 'DAV Public School, Chandigarh', type: 'Aided' },
        ],
      },
      {
        id: 'ludhiana',
        name: 'Ludhiana',
        schools: [
          { id: 'dps-ldh', name: 'Delhi Public School, Ludhiana', type: 'Private' },
          { id: 'kv-ldh', name: 'Kendriya Vidyalaya, Ludhiana', type: 'Government' },
          { id: 'dav-ldh', name: 'DAV Public School, Ludhiana', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'KL',
    name: 'Kerala',
    code: 'KL',
    districts: [
      {
        id: 'kochi',
        name: 'Ernakulam (Kochi)',
        schools: [
          { id: 'dps-kochi', name: 'Delhi Public School, Kochi', type: 'Private' },
          { id: 'kv-kochi', name: 'Kendriya Vidyalaya, Kochi', type: 'Government' },
          { id: 'dav-kochi', name: 'DAV Public School, Kochi', type: 'Aided' },
          { id: 'choice-kochi', name: 'Choice School', type: 'Private' },
        ],
      },
      {
        id: 'trivandrum',
        name: 'Thiruvananthapuram',
        schools: [
          { id: 'dps-tvm', name: 'Delhi Public School, Trivandrum', type: 'Private' },
          { id: 'kv-tvm', name: 'Kendriya Vidyalaya, Trivandrum', type: 'Government' },
          { id: 'dav-tvm', name: 'DAV Public School, Trivandrum', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'AP',
    name: 'Andhra Pradesh',
    code: 'AP',
    districts: [
      {
        id: 'visakhapatnam',
        name: 'Visakhapatnam',
        schools: [
          { id: 'dps-vsp', name: 'Delhi Public School, Visakhapatnam', type: 'Private' },
          { id: 'kv-vsp', name: 'Kendriya Vidyalaya, Visakhapatnam', type: 'Government' },
          { id: 'dav-vsp', name: 'DAV Public School, Visakhapatnam', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'TG',
    name: 'Telangana',
    code: 'TG',
    districts: [
      {
        id: 'hyderabad',
        name: 'Hyderabad',
        schools: [
          { id: 'dps-hyd', name: 'Delhi Public School, Hyderabad', type: 'Private' },
          { id: 'kv-hyd', name: 'Kendriya Vidyalaya, Hyderabad', type: 'Government' },
          { id: 'dav-hyd', name: 'DAV Public School, Hyderabad', type: 'Aided' },
          { id: 'oakridge-hyd', name: 'Oakridge International School', type: 'Private' },
        ],
      },
    ],
  },
  {
    id: 'AS',
    name: 'Assam',
    code: 'AS',
    districts: [
      {
        id: 'guwahati',
        name: 'Kamrup Metropolitan (Guwahati)',
        schools: [
          { id: 'dps-gwh', name: 'Delhi Public School, Guwahati', type: 'Private' },
          { id: 'kv-gwh', name: 'Kendriya Vidyalaya, Guwahati', type: 'Government' },
          { id: 'dav-gwh', name: 'DAV Public School, Guwahati', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'BR',
    name: 'Bihar',
    code: 'BR',
    districts: [
      {
        id: 'patna',
        name: 'Patna',
        schools: [
          { id: 'dps-pat', name: 'Delhi Public School, Patna', type: 'Private' },
          { id: 'kv-pat', name: 'Kendriya Vidyalaya, Patna', type: 'Government' },
          { id: 'dav-pat', name: 'DAV Public School, Patna', type: 'Aided' },
        ],
      },
    ],
  },
  {
    id: 'MP',
    name: 'Madhya Pradesh',
    code: 'MP',
    districts: [
      {
        id: 'bhopal',
        name: 'Bhopal',
        schools: [
          { id: 'dps-bpl', name: 'Delhi Public School, Bhopal', type: 'Private' },
          { id: 'kv-bpl', name: 'Kendriya Vidyalaya, Bhopal', type: 'Government' },
          { id: 'dav-bpl', name: 'DAV Public School, Bhopal', type: 'Aided' },
        ],
      },
      {
        id: 'indore',
        name: 'Indore',
        schools: [
          { id: 'dps-ind', name: 'Delhi Public School, Indore', type: 'Private' },
          { id: 'kv-ind', name: 'Kendriya Vidyalaya, Indore', type: 'Government' },
          { id: 'dav-ind', name: 'DAV Public School, Indore', type: 'Aided' },
        ],
      },
    ],
  },
];

// Helper function to get districts by state
export const getDistrictsByState = (stateId: string): District[] => {
  const state = INDIAN_STATES_SCHOOLS.find((s) => s.id === stateId);
  return state?.districts || [];
};

// Helper function to get schools by district
export const getSchoolsByDistrict = (stateId: string, districtId: string): School[] => {
  const state = INDIAN_STATES_SCHOOLS.find((s) => s.id === stateId);
  const district = state?.districts.find((d) => d.id === districtId);
  return district?.schools || [];
};

// Helper function to search schools
export const searchSchools = (query: string): School[] => {
  const results: School[] = [];
  const lowerQuery = query.toLowerCase();

  INDIAN_STATES_SCHOOLS.forEach((state) => {
    state.districts.forEach((district) => {
      district.schools.forEach((school) => {
        if (school.name.toLowerCase().includes(lowerQuery)) {
          results.push(school);
        }
      });
    });
  });

  return results;
};
