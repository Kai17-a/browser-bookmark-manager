export interface TagCreateRequest {
    name: string;
}

export interface TagAttachRequest {
    tag_id: number;
}

export interface TagResponse {
    id: number;
    name: string;
}
