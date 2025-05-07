import { FlashcastrFlashesDb } from "../mongodb/flashcastr";
import { Flashcastr } from "../mongodb/flashcastr/types";
import { Flashes } from "../mongodb/flashes";
import { Users } from "../mongodb/users";
import neynarClient from "../neynar/client";
import { encrypt } from "../utils";

class SignupTask {
  public async handle({ fid, signer_uuid, username }: { fid: number; signer_uuid: string; username: string }): Promise<void> {
    const encryptionKey = process.env.SIGNER_ENCRYPTION_KEY;

    if (!encryptionKey) {
      throw new Error("SIGNER_ENCRYPTION_KEY is not set in the environment");
    }

    const encryptedSigner = encrypt(signer_uuid, encryptionKey);

    await new Users().insert({
      fid,
      signer_uuid: encryptedSigner,
      username,
      auto_cast: true,
      historic_sync: false,
    });

    const {
      users: [neynarUser],
    } = await neynarClient.fetchBulkUsers({ fids: [fid] });

    const flashes = await new Flashes().getMany({
      player: {
        $eq: username,
      },
    });

    if (!flashes.length) {
      return;
    }

    const docs: Flashcastr[] = [];

    for (const flash of flashes) {
      docs.push({
        flash,
        user: neynarUser,
        castHash: null,
      });
    }

    await new FlashcastrFlashesDb().insertMany(docs);
  }
}

export default SignupTask;
