import { BaseApi } from "./base";

export type User = {
  username: string;
  auto_cast: boolean;
};

export class UsersApi extends BaseApi {
  public async getUser(fid?: number): Promise<User | null> {
    if (!fid) {
      return null;
    }

    const response = await this.api.post("/graphql", {
      query: `
        query Users($fid: Int!) {
          users(fid: $fid) {
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
}
