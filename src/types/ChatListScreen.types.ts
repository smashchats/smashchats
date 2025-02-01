import { Contact } from "@/src/db/models/Contacts";
import { Message } from "@/src/db/models/Messages";
import { TrustRelation } from "@/src/db/models/TrustRelation";

export interface ChatListView {
    did_id: Contact["did_id"];
    meta_title: Contact["meta_title"];
    meta_avatar?: Contact["meta_avatar"];
    meta_description?: Contact["meta_description"];
    notes?: Contact["notes"];
    active: Contact["active"];
    smashed: Contact["smashed"];
    created_at: Contact["created_at"];
    most_recent_message: Message["data"];
    most_recent_message_type: Message["type"];
    trusted_name?: TrustRelation["name"];
    most_recent_message_date: number;
    unread_count: number;
}
