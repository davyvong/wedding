import { Document, ObjectId } from 'mongodb';

export interface GuestGroupData {
  guests: string[];
  id: string;
}

class GuestGroup {
  public guests: string[];
  public id: string;

  constructor(data: GuestGroupData) {
    this.guests = data.guests;
    this.id = data.id;
  }

  public static fromDocument(doc: Document): GuestGroup {
    const data: GuestGroupData = {
      guests: doc.guests.map((guestId: ObjectId) => guestId.toString()),
      id: doc._id.toString(),
    };
    return new GuestGroup(data);
  }

  public toPlainObject(): GuestGroupData {
    return {
      guests: this.guests,
      id: this.id,
    };
  }
}

export default GuestGroup;
