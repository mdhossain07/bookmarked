import "server-only";
import { ErrorCodes, HttpStatus, type LoginRequest, type RegisterRequest } from "@/shared";
import { comparePassword, hashPassword } from "../auth/password";
import { ApiError } from "../http/errors";
import { UserModel, type UserDoc } from "../models/User";

// bcrypt hash of a random string: unknown emails still pay for one compare, so timing does not reveal them.
const DUMMY_PASSWORD_HASH = "$2b$12$/CfqZxDS6kL6mFSORZS3L.SRqPvx83C0MJTUvjJNxm2z3VZy67Gsy";

const invalidCredentials = () =>
  new ApiError("Invalid email or password", HttpStatus.UNAUTHORIZED, ErrorCodes.AUTHENTICATION_ERROR);

export async function registerUser({ email, password, firstName, lastName }: RegisterRequest): Promise<UserDoc> {
  if (await UserModel.findByEmail(email)) {
    throw new ApiError("User already exists with this email", HttpStatus.CONFLICT, ErrorCodes.DUPLICATE_RESOURCE);
  }

  return UserModel.create({
    email,
    password: await hashPassword(password),
    firstName,
    lastName,
    lastLogin: new Date(),
  });
}

export async function loginUser({ email, password }: LoginRequest): Promise<UserDoc> {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    await comparePassword(password, DUMMY_PASSWORD_HASH);
    throw invalidCredentials();
  }

  // Password first (S3): only the account owner learns that it is deactivated.
  if (!(await comparePassword(password, user.password))) throw invalidCredentials();
  if (!user.isActive) {
    throw new ApiError("Account is deactivated", HttpStatus.UNAUTHORIZED, ErrorCodes.AUTHENTICATION_ERROR);
  }

  user.lastLogin = new Date();
  await user.save();
  return user;
}
