// Comprehensive list of cities and towns in India organized by state code
export const CITIES_BY_STATE: Record<string, string[]> = {
  AP: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada", "Anantapur", "Kadapa", "Eluru", "Ongole", "Nandyal", "Machilipatnam", "Adoni", "Tenali", "Chittoor", "Hindupur", "Proddatur", "Bhimavaram", "Madanapalle", "Guntakal", "Dharmavaram", "Gudivada", "Srikakulam", "Narasaraopet", "Rajampet", "Tadpatri", "Tadepalligudem", "Chilakaluripet"],
  AR: ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila", "Tezu", "Seppa", "Changlang", "Khonsa", "Namsai", "Roing", "Daporijo", "Aalo"],
  AS: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Goalpara", "Dhubri", "Karimganj", "Sivasagar", "Diphu", "Barpeta", "Golaghat", "Haflong", "Mangaldoi", "Nalbari", "North Lakhimpur", "Rangia", "Sibsagar", "Hojai"],
  BR: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra", "Danapur", "Bettiah", "Saharsa", "Sasaram", "Hajipur", "Dehri", "Siwan", "Motihari", "Nawada", "Bagaha", "Buxar", "Kishanganj", "Sitamarhi", "Jamalpur", "Jehanabad", "Aurangabad"],
  CT: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Mahasamund", "Dhamtari", "Chirmiri", "Bhatapara", "Dalli-Rajhara", "Naila Janjgir", "Tilda Newra", "Mungeli", "Manendragarh", "Sakti"],
  GA: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim", "Cuncolim", "Quepem", "Canacona", "Pernem"],
  GJ: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad", "Morbi", "Surendranagar", "Bharuch", "Mehsana", "Bhuj", "Porbandar", "Palanpur", "Valsad", "Vapi", "Navsari", "Veraval", "Godhra", "Patan", "Kalol", "Dahod", "Botad", "Amreli", "Deesa", "Jetpur"],
  HR: ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh", "Jind", "Thanesar", "Kaithal", "Rewari", "Palwal", "Hansi", "Narnaul", "Fatehabad", "Gohana", "Tohana", "Narwana"],
  HP: ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Hamirpur", "Bilaspur", "Una", "Palampur", "Nahan", "Sundernagar", "Chamba", "Baddi", "Parwanoo", "Kangra", "Nurpur", "Rampur", "Manali"],
  JH: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar", "Chirkunda", "Sahibganj", "Chaibasa", "Dumka", "Gumla", "Madhupur", "Mihijam", "Saunda"],
  KA: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Davanagere", "Ballari", "Vijayapura", "Shivamogga", "Tumakuru", "Raichur", "Bidar", "Hospet", "Hassan", "Gadag-Betageri", "Udupi", "Robertson Pet", "Bhadravati", "Chitradurga", "Kolar", "Mandya", "Chikmagalur", "Gangavati", "Bagalkot", "Ranebennuru"],
  KL: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Malappuram", "Kannur", "Kottayam", "Kasaragod", "Pathanamthitta", "Idukki", "Wayanad", "Thalassery", "Ponnani", "Vatakara", "Kanhangad", "Payyanur", "Koyilandy", "Parappanangadi", "Kalamassery", "Neyyattinkara"],
  MP: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Katni", "Singrauli", "Burhanpur", "Khandwa", "Bhind", "Chhindwara", "Guna", "Shivpuri", "Vidisha", "Chhatarpur", "Damoh", "Mandsaur", "Khargone", "Neemuch", "Pithampur", "Hoshangabad", "Itarsi"],
  MH: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Navi Mumbai", "Sangli", "Malegaon", "Akola", "Latur", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Jalgaon", "Bhusawal", "Nanded", "Satara", "Beed", "Yavatmal", "Kamptee", "Gondia", "Barshi", "Achalpur", "Osmanabad", "Nandurbar"],
  MN: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Ukhrul", "Senapati", "Tamenglong", "Jiribam", "Moreh"],
  ML: ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara", "Williamnagar", "Nongpoh", "Mairang", "Resubelpara"],
  MZ: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Saiha", "Lawngtlai", "Mamit"],
  NL: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Phek", "Mon", "Longleng", "Kiphire", "Peren"],
  OD: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda", "Jeypore", "Bargarh", "Balangir", "Rayagada", "Bhawanipatna", "Dhenkanal", "Barbil", "Kendujhar", "Sunabeda", "Jatani", "Paradip"],
  PB: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur", "Batala", "Moga", "Malerkotla", "Khanna", "Phagwara", "Muktsar", "Barnala", "Rajpura", "Firozpur", "Kapurthala", "Faridkot", "Sunam", "Mansa", "Nabha", "Tarn Taran", "Jagraon", "Abohar"],
  RJ: ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar", "Kishangarh", "Tonk", "Beawar", "Hanumangarh", "Gangapur City", "Churu", "Dhaulpur", "Sawai Madhopur", "Jhunjhunu", "Barmer", "Nagaur", "Chittorgarh", "Bundi", "Banswara", "Dungarpur", "Jaisalmer"],
  SK: ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo", "Jorethang", "Singtam", "Ravangla"],
  TN: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Thanjavur", "Dindigul", "Ranipet", "Sivakasi", "Karur", "Udhagamandalam", "Hosur", "Nagercoil", "Kanchipuram", "Kumarapalayam", "Karaikkudi", "Neyveli", "Cuddalore", "Kumbakonam", "Tiruvannamalai", "Pollachi", "Rajapalayam", "Gudiyatham", "Pudukkottai", "Vaniyambadi"],
  TS: ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Siddipet", "Miryalaguda", "Jagtial", "Mancherial", "Nirmal", "Kamareddy", "Bhongir", "Palwancha", "Kothagudem", "Bodhan", "Sangareddy", "Metpally", "Zahirabad", "Medak", "Vikarabad"],
  TR: ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Belonia", "Khowai", "Ambassa", "Teliamura", "Sabroom", "Sonamura"],
  UP: ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi", "Muzaffarnagar", "Mathura", "Rampur", "Shahjahanpur", "Farrukhabad", "Ayodhya", "Maunath Bhanjan", "Hapur", "Etawah", "Mirzapur", "Bulandshahr", "Sambhal", "Amroha", "Hardoi", "Fatehpur", "Raebareli", "Orai", "Sitapur", "Bahraich", "Modinagar", "Unnao", "Jaunpur", "Lakhimpur", "Hathras", "Banda", "Pilibhit", "Barabanki", "Khurja", "Gonda", "Mainpuri", "Lalitpur", "Etah", "Deoria", "Budaun", "Basti", "Chandausi", "Akbarpur", "Ballia", "Tanda", "Greater Noida", "Shikohabad", "Shamli", "Awagarh", "Kasganj"],
  UK: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Kotdwar", "Ramnagar", "Pithoragarh", "Jaspur", "Manglaur", "Nainital", "Mussoorie", "Tehri", "Pauri", "Bageshwar", "Almora", "Champawat", "Rudraprayag"],
  WB: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur", "Dankuni", "Dhulian", "Ranaghat", "Haldia", "Raiganj", "Krishnanagar", "Nabadwip", "Medinipur", "Jalpaiguri", "Balurghat", "Basirhat", "Bankura", "Chakdaha", "Darjeeling", "Alipurduar", "Purulia", "Jangipur", "Bangaon", "Cooch Behar"],
  AN: ["Port Blair", "Car Nicobar", "Diglipur", "Mayabunder", "Rangat", "Hut Bay"],
  CH: ["Chandigarh"],
  DD: ["Daman", "Diu", "Silvassa"],
  DL: ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi", "Shahdara"],
  JK: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua", "Sopore", "Pulwama", "Rajouri", "Punch", "Kupwara", "Bandipore", "Ganderbal", "Kulgam", "Shopian", "Budgam", "Samba", "Reasi", "Kishtwar", "Doda", "Ramban"],
  LA: ["Leh", "Kargil", "Nubra", "Zanskar"],
  LD: ["Kavaratti", "Agatti", "Amini", "Andrott", "Minicoy"],
  PY: ["Puducherry", "Karaikal", "Mahe", "Yanam", "Oulgaret", "Villianur", "Bahour", "Nettapakkam"],
};

// Get cities for a specific state
export const getCitiesByState = (stateCode: string): string[] => {
  return CITIES_BY_STATE[stateCode] || [];
};
