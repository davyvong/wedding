interface Guest {
  email: string;
  id: string;
  name: string;
}

interface Invite {
  guests: Guest[];
  id: string;
}

interface Response {
  guest: Guest;
  id: string;
}

export class MongoDBDocumentBuilder {
  private doc;

  constructor(doc) {
    this.doc = doc;
  }

  public toGuest(): Guest {
    return {
      email: this.doc.email,
      id: this.doc._id.toString(),
      name: this.doc.name,
    };
  }

  public toInvite(): Invite {
    return {
      guests: this.doc.guests,
      id: this.doc._id.toString(),
    };
  }

  public toResponse(): Response {
    return {
      guest: this.doc.guest,
      id: this.doc._id.toString(),
    };
  }
}
