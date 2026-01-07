import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class UserEntity {
  id: string;
  email: string;

  @Exclude()
  passwordHash: string;

  @Exclude()
  salt?: string;

  phone?: string;

  @Exclude()
  deletedAt?: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

export class GuardianEntity {
  id: string;

  @Type(() => UserEntity)
  user: UserEntity;

  constructor(partial: Partial<GuardianEntity>) {
    Object.assign(this, partial);
  }
}

export class StudentEntity {
  id: string;
  firstName: string;
  lastName: string;

  @Type(() => UserEntity)
  user?: UserEntity;

  @Type(() => ParentStudentMappingEntity)
  guardians?: ParentStudentMappingEntity[];

  @Exclude()
  deletedAt?: Date;

  constructor(partial: Partial<StudentEntity>) {
    Object.assign(this, partial);
  }
}

export class ParentStudentMappingEntity {
  id: string;

  @Type(() => GuardianEntity)
  guardian: GuardianEntity;

  relationship: string;

  constructor(partial: Partial<ParentStudentMappingEntity>) {
    Object.assign(this, partial);
  }
}
