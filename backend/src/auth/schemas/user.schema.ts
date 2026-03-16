import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '@wombto18/shared';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: String, required: true, unique: true, index: true })
  email!: string;

  @Prop({ type: String, required: true })
  phone!: string;

  @Prop({ type: String, required: true })
  fullName!: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.PARENT })
  role!: UserRole;

  /** Linked child registration IDs for this user */
  @Prop({ type: [String], default: [] })
  registrationIds!: string[];

  @Prop({ type: Boolean, default: false })
  isEmailVerified!: boolean;

  @Prop({ type: Boolean, default: false })
  isPhoneVerified!: boolean;

  @Prop({ type: Boolean, default: false })
  isFirstLoginComplete!: boolean;

  /** Last login timestamp for welcome back messages */
  @Prop({ type: Date })
  lastLoginAt?: Date;

  /** Cloudinary profile picture URL */
  @Prop({ type: String, default: '' })
  profilePictureUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
