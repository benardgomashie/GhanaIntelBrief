import type { Article } from '@/app/lib/types';

export const articles: Article[] = [
  {
    id: '1',
    title: 'Ghana Launches New Digital Currency Initiative to Boost Economy',
    category: 'Tech',
    date: '2024-07-29',
    imageUrlId: 'tech-currency',
    summary: `
- The Bank of Ghana has announced the pilot phase of its new central bank digital currency (CBDC), the "e-Cedi".
- This initiative aims to modernize the financial system, promote financial inclusion, and reduce transaction costs.
- The e-Cedi will be accessible via mobile apps and smart cards, targeting both banked and unbanked populations.
- Collaboration with local fintech companies is a key part of the rollout strategy to foster innovation and local talent.
- The pilot will run for 12 months in select regions before a potential nationwide launch based on performance data.
  `.trim(),
    relevance:
      "This move towards a digital currency is a significant step in Ghana's digital transformation. It has the potential to enhance economic growth by creating new opportunities in the tech sector and improving the efficiency of monetary policy.",
    sources: [
      { name: 'Ghana News Agency', url: '#' },
      { name: 'MyJoyOnline', url: '#' },
      { name: 'Reuters', url: '#' },
    ],
  },
  {
    id: '2',
    title: 'Accra Sets Record for Foreign Direct Investment in Q2 2024',
    category: 'Business',
    date: '2024-07-28',
    imageUrlId: 'business-investment',
    summary: `
- Ghana's capital, Accra, has attracted a record $1.2 billion in Foreign Direct Investment (FDI) in the second quarter.
- The majority of investment is flowing into the technology, real estate, and manufacturing sectors.
- Government policy reforms and a stable political climate are cited as major contributors to investor confidence.
- The Ghana Investment Promotion Centre (GIPC) highlights a 40% increase in FDI compared to the same period last year.
- New jobs are expected to be created, with a significant portion in high-skilled technology roles.
  `.trim(),
    relevance:
      "The surge in FDI is a strong indicator of Ghana's growing economic health and its attractiveness as an investment hub in West Africa. This influx of capital will fuel job creation, infrastructure development, and overall economic growth.",
    sources: [
      { name: 'Business & Financial Times', url: '#' },
      { name: 'Bloomberg', url: '#' },
    ],
  },
  {
    id: '3',
    title: 'New Education Policy Focuses on STEM and Digital Literacy',
    category: 'Policy',
    date: '2024-07-27',
    imageUrlId: 'policy-education',
    summary: `
- The Ministry of Education has unveiled a new policy framework aimed at strengthening STEM education from primary school.
- The policy includes provisions for new curricula, teacher training programs, and the establishment of tech labs in schools.
- A core objective is to equip the youth with digital literacy skills required for the future job market.
- Public-private partnerships are being encouraged to fund and implement the new educational initiatives.
- The policy aims to make Ghana a leader in technology and innovation in Africa within the next decade.
  `.trim(),
    relevance:
      'This policy is a critical long-term investment in Ghana\'s human capital. By focusing on STEM and digital literacy, the government is laying the groundwork for a future workforce that can drive innovation, attract tech investment, and secure sustainable growth.',
    sources: [
      { name: 'Daily Graphic', url: '#' },
      { name: 'UNESCO', url: '#' },
      { name: 'Citi Newsroom', url: '#' },
    ],
  },
];
