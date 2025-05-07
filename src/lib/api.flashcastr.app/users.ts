import { BaseApi } from "./base";

export type User = {
  fid: number;
  username: string;
  auto_cast: boolean;
};

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

    return response.data.data.setUserAutoCast;
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
}
