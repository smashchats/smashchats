export interface DNSoverHttpsResponse {
    Status: number;
    TC: boolean;
    RD: boolean;
    RA: boolean;
    AD: boolean;
    CD: boolean;
    Question: Question[];
    Answer?: Answer[];
    edns_client_subnet?: string;
    Comment?: string;
}

export interface Answer {
    name: string;
    type: number;
    TTL?: number;
    data: string;
}

export interface Question {
    name: string;
    type: number;
}
