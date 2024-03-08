export interface GuestData {
  email: string;
  id: string;
  isAdmin: boolean;
  name: string;
}

export interface GuestRowData {
  email: string;
  guest_group_id: number | null;
  is_admin: number;
  name: string;
  public_id: string;
}

export interface GuestSupabaseData {
  email: string;
  guest_group_id: string | null;
  id: string;
  is_admin: boolean;
  name: string;
}

class Guest {
  public email: string;
  public id: string;
  public isAdmin: boolean;
  public name: string;

  constructor(data: GuestData) {
    this.email = data.email;
    this.id = data.id;
    this.isAdmin = data.isAdmin;
    this.name = data.name;
  }

  public static fromRow(row: GuestRowData): Guest {
    const data: GuestData = {
      email: row.email || '',
      id: row.public_id,
      isAdmin: Boolean(row.is_admin),
      name: row.name,
    };
    return new Guest(data);
  }

  public static fromSupabase(data: GuestSupabaseData): Guest {
    return new Guest({
      email: data.email,
      id: data.id,
      isAdmin: data.is_admin,
      name: data.name,
    });
  }

  public valueOf(): Omit<GuestData, 'isAdmin'> {
    return {
      email: this.email,
      id: this.id,
      name: this.name,
    };
  }
}

export default Guest;
