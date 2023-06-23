import type { Document } from 'mongodb';

interface MDBResponseData {
  guest: string;
  id: string;
}

class MDBResponse {
  public guest: string;
  public id: string;

  constructor(data: MDBResponseData) {
    this.guest = data.guest;
    this.id = data.id;
  }

  public static fromDocument(doc: Document): MDBResponse {
    const data: MDBResponseData = {
      guest: doc.guest,
      id: doc._id.toString(),
    };
    return new MDBResponse(data);
  }
}

export default MDBResponse;
