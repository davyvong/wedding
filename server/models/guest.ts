import type { Document } from 'mongodb';

export interface GuestData {
  email: string;
  id: string;
  name: string;
}

export interface GuestRowData {
  email: string;
  guest_group_id: number | null;
  name: string;
  public_id: string;
}

class Guest {
  public email: string;
  public id: string;
  public name: string;

  constructor(data: GuestData) {
    this.email = data.email;
    this.id = data.id;
    this.name = data.name;
  }

  public static fromDocument(doc: Document): Guest {
    const data: GuestData = {
      email: doc.email,
      id: doc._id.toString(),
      name: doc.name,
    };
    return new Guest(data);
  }

  public static fromRow(row: GuestRowData): Guest {
    const data: GuestData = {
      email: row.email || '',
      id: row.public_id,
      name: row.name,
    };
    return new Guest(data);
  }

  public toPlainObject(): GuestData {
    return {
      email: this.email,
      id: this.id,
      name: this.name,
    };
  }
}

export default Guest;
