export interface InvitationData {
  graduateName: string;
  graduates?: string[];
  prefix: string; // e.g. "Bachilleres", "Lic."
  degree: string;
  institution: string;
  faculty: string;
  honor: string; // e.g. "Promoción 2026 · Bachilleres"
  hosts?: string[];
  mapsUrl?: string;
  quote: string;
  quoteAuthor: string;
  targetDate: string; // ISO string e.g. "2026-12-12T19:00:00"
  ceremonyVenue: {
    name: string;
    address: string;
    time: string;
  };
  partyVenue: {
    name: string;
    address: string;
    time: string;
    city: string;
    lat: number;
    lng: number;
    parkingInfo: string;
  };
  dressCode: {
    title: string;
    description: string;
    ladies: string;
    gentlemen: string;
  };
  giftInfo: {
    type: string; // "Lluvia de Sobres"
    description: string;
    bankDetails?: string;
  };
}

export interface RsvpEntry {
  id: string;
  name: string;
  phone: string;
  email: string;
  attending: boolean;
  companions: number;
  dietary: string;
  songRequest?: string;
  message?: string;
  createdAt: string;
  ticketCode: string;
}
