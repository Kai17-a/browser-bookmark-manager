export interface FolderCreateRequest {
    name: string;
}

export interface FolderResponse {
    id: number;
    name: string;
    created_at: string;
}
