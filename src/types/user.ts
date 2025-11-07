// src/types/user.ts
export interface IUser {
    id: number;
    email: string;
    name: string;
    avatar_url: string | null;
    google_id: string | null;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface IUserCreate {
    email: string;
    password: string;
    name: string;
}

export interface IUserUpdate {
    name?: string;
    // avatar_url?: string;
}

export interface IPasswordReset {
    email: string;
}

export interface IPasswordChange {
    current_password: string;
    new_password: string;
}

export interface IUserLogin {
    email: string;
    password: string;
}

export interface IUserResponse {
    success: boolean;
    data?: IUser;
    message?: string;
    error?: string;
}

export interface IUsersResponse {
    success: boolean;
    data: IUser[];
    message?: string;
    error?: string;
}