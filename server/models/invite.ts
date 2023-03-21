class Invite {
  static toJSON(doc) {
    return {
      guests: doc.guests,
      id: doc._id,
    };
  }
}

export default Invite;
