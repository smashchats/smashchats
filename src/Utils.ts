import * as FileSystem from "expo-file-system";
import ImageResizer from "@bam.tech/react-native-image-resizer";

import { DIDDocument } from "@smashchats/library";

import { Message } from "@/src/app/profile/[user]/(tabs)/messages.js";

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

export type UniqueArray<T> = T[] & { __unique: never };

export function createUniqueArray<T extends { id: number }>(
    arr: ReadonlyArray<T>
): UniqueArray<T> {
    const seenIds = new Set<number>();
    const uniqueArray = arr.filter((item) => {
        if (seenIds.has(item.id)) {
            return false;
        } else {
            seenIds.add(item.id);
            return true;
        }
    });
    return uniqueArray as UniqueArray<T>;
}

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

export const addSystemDateMessages = (messages: Message[]): Message[] => {
    const newMessages: Message[] = [];
    let previousDate = new Date(0);

    messages.forEach((message) => {
        const msgDate = message.date.toISOString().substring(0, 10);
        if (msgDate != previousDate.toISOString().substring(0, 10)) {
            newMessages.push({
                type: "system-date",
                date: new Date(msgDate),
                content: msgDate,
                sha256: message.date.toISOString(),
                from: "system",
                fromMe: false,
            });
            previousDate = message.date;
        }
        newMessages.push(message);
    });
    return newMessages;
};

export function uniqueByKey<T, K extends keyof T>(array: T[], key: K): T[] {
    const seen = new Set<T[K]>();
    return array.filter((item) => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

export function uniqueStrings(array: string[]): string[] {
    return Array.from(new Set(array));
}

export const convertImageToBase64 = async (fileUri: string) => {
    try {
        const base64Data = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        return base64Data;
    } catch (error) {
        console.error("Error converting image to base64:", error);

        return null;
    }
};

export const DEFAULT_RESIZE_OPTIONS = {
    onlyScaleDown: true,
    quality: 100,
    width: 150,
    height: 150,
    format: "JPEG" as const,
};

export const resizeImage = async (
    path: string,
    options: Partial<typeof DEFAULT_RESIZE_OPTIONS> = DEFAULT_RESIZE_OPTIONS
) => {
    const { onlyScaleDown, quality, width, height, format } = {
        ...DEFAULT_RESIZE_OPTIONS,
        ...options,
    };
    return ImageResizer.createResizedImage(
        path,
        width,
        height,
        format,
        quality,
        0,
        null,
        false,
        {
            onlyScaleDown,
        }
    );
};
