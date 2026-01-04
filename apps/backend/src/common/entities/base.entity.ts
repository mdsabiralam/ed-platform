export abstract class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean; // Optional for in-memory use, typically handled via deletedAt in DB
}
