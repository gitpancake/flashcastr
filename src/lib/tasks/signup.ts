import { UsersApi } from "../api.flashcastr.app/users";
import { encrypt } from "../utils";

class SignupTask {
  public async handle({ fid, signer_uuid, username }: { fid: number; signer_uuid: string; username: string }): Promise<void> {
    const encryptionKey = process.env.SIGNER_ENCRYPTION_KEY;

    if (!encryptionKey) {
      throw new Error("SIGNER_ENCRYPTION_KEY is not set in the environment");
    }

    const encryptedSigner = encrypt(signer_uuid, encryptionKey);

    const apiKey = process.env.FLASHCASTR_API_KEY;

    if (!apiKey) {
      throw new Error("FLASHCASTR_API_KEY is not set in the environment");
    }

    try {
      await new UsersApi().signup(fid, encryptedSigner, username, apiKey);
    } catch (ex) {
      console.log(ex);
    }
  }
}

export default SignupTask;
