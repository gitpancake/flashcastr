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

export class UsersApi extends BaseApi {
  public async getUser(fid?: number): Promise<User[]> {
    if (!fid) {
      return [];
    }

    const response = await this.api.post("/graphql", {
      query: `
        query Users($fid: Int!) {
          users(fid: $fid) {
		  	    fid
            username
			      auto_cast
          }
        }
      `,
      variables: {
        fid,
      },
    });

    return response.data.data.users;
  }

  public async initiateSignup(username: string): Promise<InitiateSignupResponse> {
    const response = await this.api.post<{ data: { initiateSignup: InitiateSignupResponse } }>("/graphql", {
      query: `
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
      variables: {
        username,
      },
    });

    if (response.data.data?.initiateSignup) {
      return response.data.data.initiateSignup;
    } else {
      // Handle cases where the expected data is not present, possibly due to GraphQL errors
      // The actual error handling might depend on how your BaseApi or axios instance is configured
      console.error("GraphQL initiateSignup error or unexpected response structure:", response.data);
      throw new Error("Failed to initiate signup or malformed response.");
    }
  }

  public async pollSignupStatus(signer_uuid: string, username: string): Promise<PollSignupStatusResponse> {
    const response = await this.api.post<{ data: { pollSignupStatus: PollSignupStatusResponse } }>("/graphql", {
      query: `
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
      variables: {
        signer_uuid,
        username,
      },
    });

    if (response.data.data?.pollSignupStatus) {
      return response.data.data.pollSignupStatus;
    } else {
      console.error("GraphQL pollSignupStatus error or unexpected response structure:", response.data);
      // It's important to return a structure that the poller can understand as an error or retryable state
      // For instance, you could throw an error that the hook then catches,
      // or return a specific status like "ERROR_CLIENT_REQUEST"
      throw new Error("Failed to poll signup status or malformed response.");
    }
  }

  public async setAutoCast(fid: number, autoCast: boolean, apiKey: string): Promise<{ auto_cast: boolean }> {
    const response = await this.api.post(
      "/graphql",
      {
        query: `
			mutation SetAutoCast($fid: Int!, $autoCast: Boolean!) {
				setUserAutoCast(fid: $fid, auto_cast: $autoCast) {
					auto_cast
				}
			}
      `,
        variables: {
          fid,
          autoCast,
        },
      },
      {
        headers: {
          "X-API-KEY": apiKey,
        },
      }
    );

    return response.data.setUserAutoCast;
  }

  public async deleteUser(fid: number, apiKey: string): Promise<{ success: boolean; message: string }> {
    const response = await this.api.post(
      "/graphql",
      {
        query: `
        mutation DeleteUser($fid: Int!) {
          deleteUser(fid: $fid) {
            success
            message
          }
        }
      `,
        variables: {
          fid,
        },
      },
      {
        headers: {
          "X-API-KEY": apiKey,
        },
      }
    );

    return response.data.data.deleteUser;
  }

  public async signup(fid: number, signer_uuid: string, username: string, apiKey: string): Promise<void> {
    const response = await this.api.post(
      "/graphql",
      {
        query: `
          mutation Signup($fid: Int!, $signer_uuid: String!, $username: String!) {
            signup(fid: $fid, signer_uuid: $signer_uuid, username: $username) {
              success
              message
            }
          }
        `,
        variables: {
          fid,
          signer_uuid,
          username,
        },
      },
      {
        headers: {
          "X-API-KEY": apiKey,
        },
      }
    );

    return response.data.signup;
  }
}
