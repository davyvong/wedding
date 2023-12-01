import { Document, ObjectId } from 'mongodb';

export interface MDBGuestGroupData {
  guests: string[];
  id: string;
}

class MDBGuestGroup {
  public guests: string[];
  public id: string;

  constructor(data: MDBGuestGroupData) {
    this.guests = data.guests;
    this.id = data.id;
  }

  public static fromDocument(doc: Document): MDBGuestGroup {
    const data: MDBGuestGroupData = {
      guests: doc.guests.map((guestId: ObjectId) => guestId.toString()),
      id: doc._id.toString(),
    };
    return new MDBGuestGroup(data);
  }

  public toPlainObject(): MDBGuestGroupData {
    return {
      guests: this.guests,
      id: this.id,
    };
  }
}

export default MDBGuestGroup;
