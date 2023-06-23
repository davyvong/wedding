export interface Guest {
  email: string;
  id: string;
  name: string;
}

export interface Invite {
  guests: Guest[];
  id: string;
}

export interface InviteResponse {
  guest: string;
  id: string;
}

export class MongoDBDocumentConverter {
  public static toGuest(doc): Guest {
    return {
      email: doc.email,
      id: doc._id.toString(),
      name: doc.name,
    };
  }

  public static toInvite(doc): Invite {
    return {
      guests: doc.guests,
      id: doc._id.toString(),
    };
  }

  public static toInviteResponse(doc): InviteResponse {
    return {
      guest: doc.guest,
      id: doc._id.toString(),
    };
  }
}
