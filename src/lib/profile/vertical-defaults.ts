export type VerticalType = 'roofing' | 'hvac' | 'solar' | 'exteriors' | 'remodeling' | 'other';

export interface ServiceDefault {
  name: string;
  price_range_usd: string;
  typical_duration_days: number;
}

export interface VerticalDefaults {
  services: ServiceDefault[];
  top_faqs: Array<{ q: string; a: string }>;
  qualifying_questions: string[];
}

export const verticalDefaults: Record<VerticalType, VerticalDefaults> = {
  roofing: {
    services: [
      {
        name: 'Roof replacement',
        price_range_usd: '8000-25000',
        typical_duration_days: 3,
      },
      {
        name: 'Roof repair/leak fix',
        price_range_usd: '300-2000',
        typical_duration_days: 1,
      },
      {
        name: 'Roof inspection',
        price_range_usd: '150-350',
        typical_duration_days: 0.5,
      },
    ],
    top_faqs: [
      {
        q: 'Do you offer financing?',
        a: 'Yes, we work with GreenSky and other lenders for 0% APR terms up to 12 months.',
      },
      {
        q: 'Are you licensed and insured?',
        a: 'Fully licensed, insured for $2M+, and backed by a lifetime warranty on labor.',
      },
      {
        q: 'How long does a roof replacement take?',
        a: 'Typically 2-3 days depending on size and complexity.',
      },
    ],
    qualifying_questions: [
      'What is the age of your current roof?',
      'Have you experienced any recent leaks or storm damage?',
      'Are you the homeowner or do you rent?',
    ],
  },
  hvac: {
    services: [
      {
        name: 'AC unit replacement',
        price_range_usd: '5000-15000',
        typical_duration_days: 1,
      },
      {
        name: 'Furnace replacement',
        price_range_usd: '4000-8000',
        typical_duration_days: 1,
      },
      {
        name: 'System maintenance',
        price_range_usd: '150-300',
        typical_duration_days: 0.25,
      },
      {
        name: 'Ductwork cleaning',
        price_range_usd: '300-800',
        typical_duration_days: 0.5,
      },
    ],
    top_faqs: [
      {
        q: 'When should I replace my HVAC system?',
        a: 'Most systems last 15-20 years. If yours is older and needs frequent repairs, replacement is often more cost-effective.',
      },
      {
        q: 'Do you offer financing?',
        a: 'Yes, flexible financing available with approved credit.',
      },
      {
        q: 'How often should I get maintenance?',
        a: 'We recommend twice yearly: spring and fall.',
      },
    ],
    qualifying_questions: [
      'How old is your current HVAC system?',
      'Is it still running properly or having issues?',
      'Have you noticed higher than normal energy bills?',
    ],
  },
  solar: {
    services: [
      {
        name: 'Full solar panel installation',
        price_range_usd: '15000-40000',
        typical_duration_days: 5,
      },
      {
        name: 'Solar panel inspection',
        price_range_usd: '200-500',
        typical_duration_days: 0.5,
      },
      {
        name: 'Battery storage system',
        price_range_usd: '10000-20000',
        typical_duration_days: 2,
      },
    ],
    top_faqs: [
      {
        q: 'What tax credits are available?',
        a: 'The federal ITC currently covers 30% of installation costs. We can help you navigate state and local incentives.',
      },
      {
        q: 'How long until payback?',
        a: 'Most systems pay for themselves in 5-7 years, then provide 25+ years of free electricity.',
      },
      {
        q: 'Does my roof need work first?',
        a: 'We recommend addressing any roof issues before going solar. We can assess during a free consultation.',
      },
    ],
    qualifying_questions: [
      'Does your roof get good sun exposure?',
      'Are you interested in battery backup?',
      'What is your typical monthly electric bill?',
    ],
  },
  exteriors: {
    services: [
      {
        name: 'Siding replacement',
        price_range_usd: '10000-30000',
        typical_duration_days: 5,
      },
      {
        name: 'Window replacement',
        price_range_usd: '5000-15000',
        typical_duration_days: 3,
      },
      {
        name: 'Door replacement',
        price_range_usd: '2000-5000',
        typical_duration_days: 1,
      },
      {
        name: 'Gutter installation/repair',
        price_range_usd: '500-2000',
        typical_duration_days: 1,
      },
    ],
    top_faqs: [
      {
        q: 'What materials do you recommend?',
        a: 'We specialize in vinyl, fiber cement, and metal options. Best choice depends on your budget and climate.',
      },
      {
        q: 'Do you handle permits?',
        a: 'Yes, we manage all permitting for you.',
      },
      {
        q: 'Can you color match existing materials?',
        a: 'We can get very close, though exact matches depend on availability.',
      },
    ],
    qualifying_questions: [
      'What is the primary issue you are seeing with your exterior?',
      'Have you had any water damage or drafts?',
      'What is your preferred material or aesthetic?',
    ],
  },
  remodeling: {
    services: [
      {
        name: 'Kitchen remodel',
        price_range_usd: '15000-50000',
        typical_duration_days: 30,
      },
      {
        name: 'Bathroom remodel',
        price_range_usd: '8000-25000',
        typical_duration_days: 14,
      },
      {
        name: 'Basement finishing',
        price_range_usd: '20000-40000',
        typical_duration_days: 45,
      },
      {
        name: 'Room addition',
        price_range_usd: '25000-75000',
        typical_duration_days: 60,
      },
    ],
    top_faqs: [
      {
        q: 'How do we start?',
        a: 'We begin with a free consultation to understand your vision, then provide a detailed proposal and timeline.',
      },
      {
        q: 'What about permits?',
        a: 'All required permits are included in our pricing.',
      },
      {
        q: 'Can you work around my schedule?',
        a: 'Yes, we are flexible with timing and can work around your family schedule.',
      },
    ],
    qualifying_questions: [
      'What room or area do you want to remodel?',
      'Do you have a budget in mind?',
      'What is your timeline for the project?',
    ],
  },
  other: {
    services: [
      {
        name: 'Custom service',
        price_range_usd: 'Contact for quote',
        typical_duration_days: 1,
      },
    ],
    top_faqs: [
      {
        q: 'How do I get a quote?',
        a: 'Contact us directly and we will assess your needs.',
      },
    ],
    qualifying_questions: [
      'What service are you interested in?',
    ],
  },
};
