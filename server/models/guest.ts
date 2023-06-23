import type { Document } from 'mongodb';

interface MDBGuestData {
  email: string;
  id: string;
  name: string;
}

class MDBGuest {
  public email: string;
  public id: string;
  public name: string;

  constructor(data: MDBGuestData) {
    this.email = data.email;
    this.id = data.id;
    this.name = data.name;
  }

  public static fromDocument(doc: Document): MDBGuest {
    const data: MDBGuestData = {
      email: doc.email,
      id: doc._id.toString(),
      name: doc.name,
    };
    return new MDBGuest(data);
  }
}

export default MDBGuest;
