/**
 * Hardcoded Portal Lookup Table
 * PORTAL_DATA[category][state] → { portal_name, portal_url, helpline, procedure_steps }
 * RESOLUTION_DAYS[category] → expected days to resolve (used by cron job)
 */

export const PORTAL_DATA = {
  water: {
    Delhi: {
      portal_name: 'Delhi Jal Board',
      portal_url: 'https://delhijalboard.delhi.gov.in',
      helpline: '1916',
      procedure_steps: [
        'Step 1: Visit the Delhi Jal Board portal or call 1916',
        'Step 2: Register your complaint under "Water Supply" category',
        'Step 3: Note the complaint reference number',
        'Step 4: Track status online or via SMS updates'
      ]
    },
    Maharashtra: {
      portal_name: 'Maharashtra Water Supply (MJPJAY)',
      portal_url: 'https://water.maharashtra.gov.in',
      helpline: '1800-233-4353',
      procedure_steps: [
        'Step 1: Visit the Maharashtra Water Supply portal',
        'Step 2: Click "Register Complaint" and fill in your area details',
        'Step 3: Upload supporting photos if available',
        'Step 4: You will receive an SMS with your complaint number'
      ]
    },
    Karnataka: {
      portal_name: 'Bangalore Water Supply (BWSSB)',
      portal_url: 'https://bwssb.karnataka.gov.in',
      helpline: '1916',
      procedure_steps: [
        'Step 1: Visit BWSSB portal or call helpline 1916',
        'Step 2: Select your ward and register a complaint',
        'Step 3: Provide meter number or area landmark',
        'Step 4: Track resolution via the portal dashboard'
      ]
    },
    'Tamil Nadu': {
      portal_name: 'Tamil Nadu Water Supply (TWAD Board)',
      portal_url: 'https://twadboard.tn.gov.in',
      helpline: '1800-425-5110',
      procedure_steps: [
        'Step 1: Visit TWAD Board website or call the toll-free number',
        'Step 2: Register under "Drinking Water Complaints"',
        'Step 3: Provide your area and supply schedule details',
        'Step 4: Follow up with your complaint ID via SMS or portal'
      ]
    },
    UP: {
      portal_name: 'UP Jal Nigam',
      portal_url: 'https://jalnigam.up.gov.in',
      helpline: '1800-180-5555',
      procedure_steps: [
        'Step 1: Visit UP Jal Nigam portal',
        'Step 2: Click "Complaint" and select your district',
        'Step 3: Fill in the complaint details and submit',
        'Step 4: Note the reference number for tracking'
      ]
    },
    Haryana: {
      portal_name: 'Haryana Public Health Engineering Dept.',
      portal_url: 'https://phed.haryana.gov.in',
      helpline: '1800-180-2468',
      procedure_steps: [
        'Step 1: Visit the PHED Haryana portal',
        'Step 2: Go to "Grievance" section and register',
        'Step 3: Submit details with your location info',
        'Step 4: Track status via the portal or CM Window'
      ]
    }
  },

  roads: {
    Delhi: {
      portal_name: 'PWD Delhi',
      portal_url: 'https://pwd.delhi.gov.in',
      helpline: '1800-11-0707',
      procedure_steps: [
        'Step 1: Visit PWD Delhi or Delhi CM Helpline portal',
        'Step 2: Select "Road/Pothole Complaint"',
        'Step 3: Provide road name, landmark and photo',
        'Step 4: Track via reference number'
      ]
    },
    Maharashtra: {
      portal_name: 'Maharashtra PWD',
      portal_url: 'https://mahapwd.gov.in',
      helpline: '1800-120-8040',
      procedure_steps: [
        'Step 1: Visit Maharashtra PWD portal',
        'Step 2: Register under "Road Damage/Pothole"',
        'Step 3: Upload geotagged photo of damage',
        'Step 4: Receive complaint tracking ID via SMS'
      ]
    },
    Karnataka: {
      portal_name: 'BBMP Roads (Bangalore)',
      portal_url: 'https://bbmp.gov.in',
      helpline: '080-22975803',
      procedure_steps: [
        'Step 1: Visit BBMP portal or Sahaya app',
        'Step 2: Register under "Road Infrastructure"',
        'Step 3: Pin location on map and upload photo',
        'Step 4: Track via BBMP Sahaya dashboard'
      ]
    },
    'Tamil Nadu': {
      portal_name: 'TN Highways Department',
      portal_url: 'https://tnhighways.gov.in',
      helpline: '044-25671824',
      procedure_steps: [
        'Step 1: Visit TN Highways portal',
        'Step 2: File grievance under "Road Maintenance"',
        'Step 3: Mention road number or NH reference',
        'Step 4: Follow up with your complaint reference'
      ]
    },
    UP: {
      portal_name: 'UP PWD',
      portal_url: 'https://uppwd.gov.in',
      helpline: '1800-180-5555',
      procedure_steps: [
        'Step 1: Visit UP PWD or Jansunwai portal',
        'Step 2: Select "Road Complaint" category',
        'Step 3: Add location details and photos',
        'Step 4: Track via Jansunwai reference number'
      ]
    },
    Haryana: {
      portal_name: 'Haryana PWD B&R',
      portal_url: 'https://haryanapwd.gov.in',
      helpline: '1800-180-2468',
      procedure_steps: [
        'Step 1: Visit Haryana PWD portal or CM Window',
        'Step 2: File grievance under road category',
        'Step 3: Provide NH/SH or village road details',
        'Step 4: Track via CM Window dashboard'
      ]
    }
  },

  electricity: {
    Delhi: {
      portal_name: 'BSES / Tata Power Delhi',
      portal_url: 'https://www.bsesdelhi.com',
      helpline: '19123',
      procedure_steps: [
        'Step 1: Visit BSES or Tata Power Delhi portal',
        'Step 2: Report outage or billing issue with your CA number',
        'Step 3: Upload meter reading photo if applicable',
        'Step 4: Track via SMS or online dashboard'
      ]
    },
    Maharashtra: {
      portal_name: 'MSEDCL (Mahavitaran)',
      portal_url: 'https://www.mahadiscom.in',
      helpline: '1912',
      procedure_steps: [
        'Step 1: Visit MSEDCL portal or call 1912',
        'Step 2: Register complaint with consumer number',
        'Step 3: Select complaint type (outage/billing/meter)',
        'Step 4: Note the docket number for tracking'
      ]
    },
    Karnataka: {
      portal_name: 'BESCOM (Bangalore Electricity)',
      portal_url: 'https://bescom.karnataka.gov.in',
      helpline: '1912',
      procedure_steps: [
        'Step 1: Visit BESCOM portal or call 1912',
        'Step 2: Enter your RR number and complaint details',
        'Step 3: Power outage complaints auto-route to local section',
        'Step 4: Track status online'
      ]
    },
    'Tamil Nadu': {
      portal_name: 'TANGEDCO',
      portal_url: 'https://tangedco.gov.in',
      helpline: '1912',
      procedure_steps: [
        'Step 1: Visit TANGEDCO portal or call 1912',
        'Step 2: Register with consumer service number',
        'Step 3: Describe the issue (outage/voltage/meter)',
        'Step 4: Receive complaint number via SMS'
      ]
    },
    UP: {
      portal_name: 'UPPCL (UP Power Corp.)',
      portal_url: 'https://uppcl.mpower.in',
      helpline: '1912',
      procedure_steps: [
        'Step 1: Visit UPPCL portal or use mPower app',
        'Step 2: Register with account number',
        'Step 3: Select issue type and location',
        'Step 4: Track via complaint reference number'
      ]
    },
    Haryana: {
      portal_name: 'UHBVN / DHBVN',
      portal_url: 'https://uhbvn.org.in',
      helpline: '1912',
      procedure_steps: [
        'Step 1: Visit UHBVN or DHBVN portal based on your area',
        'Step 2: Register complaint with consumer ID',
        'Step 3: Describe outage or billing issue',
        'Step 4: Track docket number via portal'
      ]
    }
  },

  sanitation: {
    Delhi: {
      portal_name: 'MCD (Municipal Corporation of Delhi)',
      portal_url: 'https://mcdonline.nic.in',
      helpline: '155305',
      procedure_steps: [
        'Step 1: Visit MCD portal or call 155305',
        'Step 2: Register under "Sanitation/Garbage" category',
        'Step 3: Provide ward number and street details',
        'Step 4: Track via MCD complaint portal'
      ]
    },
    Maharashtra: {
      portal_name: 'BMC (Mumbai) / PMC (Pune)',
      portal_url: 'https://portal.mcgm.gov.in',
      helpline: '1800-267-0000',
      procedure_steps: [
        'Step 1: Visit BMC or local municipal portal',
        'Step 2: Click "Register Complaint" under Sanitation',
        'Step 3: Upload photo of area (optional)',
        'Step 4: Note complaint number from acknowledgment'
      ]
    },
    Karnataka: {
      portal_name: 'BBMP Solid Waste Management',
      portal_url: 'https://bbmp.gov.in/swm',
      helpline: '080-22660000',
      procedure_steps: [
        'Step 1: Visit BBMP SWM portal or Sahaya app',
        'Step 2: Report under "Garbage/Sanitation"',
        'Step 3: Tag your ward and pin location',
        'Step 4: Track via BBMP dashboard'
      ]
    },
    'Tamil Nadu': {
      portal_name: 'Greater Chennai Corp / Local Municipality',
      portal_url: 'https://chennaicorporation.gov.in',
      helpline: '1913',
      procedure_steps: [
        'Step 1: Visit Chennai Corporation or local body portal',
        'Step 2: Select "Solid Waste / Sanitation" complaint',
        'Step 3: Provide zone and ward details',
        'Step 4: Track via complaint reference number'
      ]
    },
    UP: {
      portal_name: 'Nagar Nigam / Nagar Palika',
      portal_url: 'https://nagarvikas.up.gov.in',
      helpline: '1800-180-5555',
      procedure_steps: [
        'Step 1: Visit UP Nagar Vikas portal or Jansunwai',
        'Step 2: Select your city and ward',
        'Step 3: File under "Sanitation/Safai" category',
        'Step 4: Track using Jansunwai complaint number'
      ]
    },
    Haryana: {
      portal_name: 'Haryana ULB / Municipal Committee',
      portal_url: 'https://ulbharyana.gov.in',
      helpline: '1800-180-2468',
      procedure_steps: [
        'Step 1: Visit ULB Haryana portal or CM Window',
        'Step 2: Register sanitation grievance',
        'Step 3: Provide locality and photo if possible',
        'Step 4: Track via CM Window reference'
      ]
    }
  }
};

// Expected resolution days per category — used by cron job follow-up scheduler
export const RESOLUTION_DAYS = {
  water: 3,
  roads: 7,
  electricity: 2,
  sanitation: 5,
  healthcare: 4,
  education: 10,
  other: 7
};
