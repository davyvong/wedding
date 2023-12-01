import type { Document } from 'mongodb';

export interface MDBResponseData {
  attendance: boolean;
  dietaryRestrictions: string;
  entree: string;
  guest: string;
  id: string;
  mailingAddress: string;
  message: string;
}

class MDBResponse {
  public attendance: boolean;
  public dietaryRestrictions: string;
  public entree: string;
  public guest: string;
  public id: string;
  public mailingAddress: string;
  public message: string;

  constructor(data: MDBResponseData) {
    this.attendance = data.attendance;
    this.dietaryRestrictions = data.dietaryRestrictions;
    this.entree = data.entree;
    this.guest = data.guest;
    this.id = data.id;
    this.mailingAddress = data.mailingAddress;
    this.message = data.message;
  }

  public static fromDocument(doc: Document): MDBResponse {
    const data: MDBResponseData = {
      attendance: doc.attendance,
      dietaryRestrictions: doc.dietaryRestrictions,
      entree: doc.entree,
      guest: doc.guest.toString(),
      id: doc._id.toString(),
      mailingAddress: doc.mailingAddress,
      message: doc.message,
    };
    return new MDBResponse(data);
  }

  public toPlainObject(): MDBResponseData {
    return {
      attendance: this.attendance,
      dietaryRestrictions: this.dietaryRestrictions,
      entree: this.entree,
      guest: this.guest,
      id: this.id,
      mailingAddress: this.mailingAddress,
      message: this.message,
    };
  }
}

export default MDBResponse;
