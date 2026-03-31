import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException
} from "@nestjs/common";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { apiEnv } from "../config/env";

const STORAGE_BUCKET = "portfolio-media";

@Injectable()
export class SupabaseService {
  readonly public = createClient(
    apiEnv.SUPABASE_URL,
    apiEnv.SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? apiEnv.SUPABASE_SERVICE_ROLE_KEY ?? ""
  );

  readonly admin =
    apiEnv.SUPABASE_SERVICE_ROLE_KEY && apiEnv.SUPABASE_SERVICE_ROLE_KEY.length > 0
      ? createClient(apiEnv.SUPABASE_URL, apiEnv.SUPABASE_SERVICE_ROLE_KEY, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        })
      : null;

  getAdminClient() {
    if (!this.admin) {
      throw new InternalServerErrorException(
        "Supabase service role access is required for this phase."
      );
    }

    return this.admin;
  }

  async verifyAccessToken(accessToken?: string | null) {
    if (!accessToken) {
      throw new UnauthorizedException("A valid Supabase session is required.");
    }

    const { data, error } = await this.getAdminClient().auth.getUser(accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException("The Supabase session is invalid or expired.");
    }

    return data.user;
  }

  createUserClient(accessToken: string): SupabaseClient {
    return createClient(
      apiEnv.SUPABASE_URL,
      apiEnv.SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? apiEnv.SUPABASE_SERVICE_ROLE_KEY ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );
  }

  getStorageBucket() {
    return STORAGE_BUCKET;
  }

  getStorage() {
    return this.getAdminClient().storage.from(STORAGE_BUCKET);
  }

  async ensureStorageBucket() {
    const admin = this.getAdminClient();
    const { data: buckets, error } = await admin.storage.listBuckets();

    if (error) {
      throw new InternalServerErrorException(
        `Could not inspect Supabase storage buckets: ${error.message}`
      );
    }

    const existingBucket = buckets.find((bucket) => bucket.name === STORAGE_BUCKET);

    if (existingBucket) {
      return;
    }

    const { error: createError } = await admin.storage.createBucket(STORAGE_BUCKET, {
      public: false,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
      fileSizeLimit: 20 * 1024 * 1024
    });

    if (createError) {
      throw new InternalServerErrorException(
        `Could not create the portfolio media bucket: ${createError.message}`
      );
    }
  }

  async createSignedUrl(path?: string | null, expiresInSeconds = 60 * 60) {
    if (!path) {
      return undefined;
    }

    const { data, error } = await this.getStorage().createSignedUrl(
      path,
      expiresInSeconds
    );

    if (error) {
      throw new InternalServerErrorException(
        `Could not create a signed asset URL: ${error.message}`
      );
    }

    return data.signedUrl;
  }

  async uploadAsset(params: {
    path: string;
    body: Buffer;
    contentType: string;
  }) {
    await this.ensureStorageBucket();

    const { error } = await this.getStorage().upload(params.path, params.body, {
      contentType: params.contentType,
      upsert: true
    });

    if (error) {
      throw new InternalServerErrorException(
        `Could not upload the portfolio asset: ${error.message}`
      );
    }
  }

  async removeAsset(path?: string | null) {
    if (!path) {
      return;
    }

    const { error } = await this.getStorage().remove([path]);

    if (error) {
      throw new InternalServerErrorException(
        `Could not remove the portfolio asset: ${error.message}`
      );
    }
  }

  toAccountId(user: User) {
    const metadataAccountId =
      typeof user.user_metadata.account_id === "string"
        ? user.user_metadata.account_id
        : null;

    return metadataAccountId ?? user.id;
  }
}
