import { Contact } from "@/src/db/models/Contacts";

export type ContactPreview = Partial<
    Pick<TrustedContact, "meta_title" | "meta_avatar" | "trusted_name">
>;

export type TrustedContact = Contact & { trusted_name: string | undefined };
