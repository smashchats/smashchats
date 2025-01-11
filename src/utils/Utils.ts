import { DIDDocument } from "@smashchats/library";
import { DNSoverHttpsResponse } from "@/src/types/";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

const DOH_SERVERS = ["https://dns.google/resolve"];
const SERVER = DOH_SERVERS[0];

const getDnsRecord = (
    domain: string,
    record_type: string
): Promise<DNSoverHttpsResponse> => {
    return fetch(`${SERVER}?name=${domain}&type=${record_type}`, {
        headers: { "Content-Type": "application/dns-json" },
    }).then((res) => res.json());
};

export const getTxtRecord = (domain: string): Promise<DNSoverHttpsResponse> => {
    return getDnsRecord(domain, "TXT");
};

export const getDidFromDomain = async (domain: string): Promise<DIDDocument> => {
    const r = await getTxtRecord(`_smash.${domain}`);
    return r.Answer![0].data as unknown as DIDDocument;
};

// Quicktyped from data available here: https://developers.google.com/speed/public-dns/docs/doh/

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export const daysBetweenTwoDates = (dateStart: Date, dateEnd: Date): number => {
    const diff =
        new Date(dateEnd.toISOString().substring(0, 10)).getTime() -
        new Date(dateStart.toISOString().substring(0, 10)).getTime();
    return Math.abs(Math.floor(diff / DAY));
};

export const addPrefixToObjectKeys = (obj: Record<string, any>, prefix: string) => {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [prefix + key, value])
    );
};

export const scrollTo = (y: number) =>
({
    nativeEvent: { contentOffset: { y } },
} as NativeSyntheticEvent<NativeScrollEvent>);
