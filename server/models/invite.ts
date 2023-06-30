import { Document, ObjectId } from 'mongodb';

export interface MDBInviteData {
  guests: string[];
  id: string;
}

class MDBInvite {
  public guests: string[];
  public id: string;

  constructor(data: MDBInviteData) {
    this.guests = data.guests;
    this.id = data.id;
  }

  public static fromDocument(doc: Document): MDBInvite {
    const data: MDBInviteData = {
      guests: doc.guests.map((guestId: ObjectId) => guestId.toString()),
      id: doc._id.toString(),
    };
    return new MDBInvite(data);
  }

  public toPlainObject(): MDBInviteData {
    return {
      guests: this.guests,
      id: this.id,
    };
  }
}

export default MDBInvite;
