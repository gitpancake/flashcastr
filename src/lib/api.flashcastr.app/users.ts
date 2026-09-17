import { BaseApi } from "./base";

export type User = {
  fid: number;
  username: string;
  auto_cast: boolean;
};

// Define the response type for the new initiateSignup mutation
export interface InitiateSignupResponse {
  signer_uuid: string;
  public_key: string;
  status: string; // e.g., "pending_approval", "approved"
  signer_approval_url?: string | null;
  fid?: number | null;
}

// Define the response type for the new pollSignupStatus query
export interface PollSignupStatusResponse {
  status: string; // "PENDING_APPROVAL", "APPROVED_FINALIZED", "REVOKED", etc.
  fid?: number | null;
  user?: User | null; // Complete user object from the database
  message?: string | null; // Optional additional information
}

export interface SignerStatusResponse {
  ok: boolean;
  status: string; // "APPROVED", "PENDING_APPROVAL", "REVOKED", "NO_SIGNER", "NEYNAR_LOOKUP_ERROR", "DECRYPT_ERROR"
  fid?: number | null;
  message?: string | null;
}

export class UsersApi extends BaseApi {
  public async getUser(fid?: number): Promise<User[]> {
    if (!fid) {
      return [];
    }

    const data = await this.graphql<{ users: User[] }>(
      `
        query Users($fid: Int!) {
          users(fid: $fid) {
            fid
            username
            auto_cast
          }
        }
      `,
      { fid }
    );

    return data.users;
  }

  public async initiateSignup(username: string): Promise<InitiateSignupResponse> {
    const data = await this.graphql<{ initiateSignup: InitiateSignupResponse }>(
      `
        mutation InitiateSignup($username: String!) {
          initiateSignup(username: $username) {
            signer_uuid
            public_key
            status
            signer_approval_url
            fid
          }
        }
      `,
      { username }
    );

    if (data?.initiateSignup) {
      return data.initiateSignup;
    } else {
      console.error("GraphQL initiateSignup error or unexpected response structure:", data);
      throw new Error("Failed to initiate signup or malformed response.");
    }
  }

  public async pollSignupStatus(signer_uuid: string, username: string): Promise<PollSignupStatusResponse> {
    const data = await this.graphql<{ pollSignupStatus: PollSignupStatusResponse }>(
      `
        query PollSignupStatus($signer_uuid: String!, $username: String!) {
          pollSignupStatus(signer_uuid: $signer_uuid, username: $username) {
            status
            fid
            user {
              fid
              username
              auto_cast
            }
            message
          }
        }
      `,
      { signer_uuid, username }
    );

    if (data?.pollSignupStatus) {
      return data.pollSignupStatus;
    } else {
      console.error("GraphQL pollSignupStatus error or unexpected response structure:", data);
      throw new Error("Failed to poll signup status or malformed response.");
    }
  }

  public async checkSignerStatus(fid: number): Promise<SignerStatusResponse> {
    const data = await this.graphql<{ checkSignerStatus: SignerStatusResponse }>(
      `
        query CheckSignerStatus($fid: Int!) {
          checkSignerStatus(fid: $fid) {
            ok
            status
            fid
            message
          }
        }
      `,
      { fid }
    );

    if (data?.checkSignerStatus) {
      return data.checkSignerStatus;
    }
    console.error("GraphQL checkSignerStatus error or unexpected response structure:", data);
    throw new Error("Failed to check signer status or malformed response.");
  }

  public async setAutoCast(fid: number, autoCast: boolean, apiKey: string): Promise<{ auto_cast: boolean }> {
    const data = await this.graphql<{ setUserAutoCast: { auto_cast: boolean } }>(
      `
        mutation SetAutoCast($fid: Int!, $autoCast: Boolean!) {
          setUserAutoCast(fid: $fid, auto_cast: $autoCast) {
            auto_cast
          }
        }
      `,
      { fid, autoCast },
      { headers: { "X-API-KEY": apiKey } }
    );

    return data.setUserAutoCast;
  }

  public async deleteUser(fid: number, apiKey: string): Promise<{ success: boolean; message: string }> {
    const data = await this.graphql<{ deleteUser: { success: boolean; message: string } }>(
      `
        mutation DeleteUser($fid: Int!) {
          deleteUser(fid: $fid) {
            success
            message
          }
        }
      `,
      { fid },
      { headers: { "X-API-KEY": apiKey } }
    );

    return data.deleteUser;
  }

  public async signup(fid: number, signer_uuid: string, username: string, apiKey: string): Promise<void> {
    await this.graphql<{ signup: { success: boolean; message: string } }>(
      `
        mutation Signup($fid: Int!, $signer_uuid: String!, $username: String!) {
          signup(fid: $fid, signer_uuid: $signer_uuid, username: $username) {
            success
            message
          }
        }
      `,
      { fid, signer_uuid, username },
      { headers: { "X-API-KEY": apiKey } }
    );
  }
}

export const usersApi = new UsersApi();
