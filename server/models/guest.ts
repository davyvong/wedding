class Guest {
  static toJSON(doc) {
    return {
      email: doc.email,
      id: doc._id,
      name: doc.name,
    };
  }
}

export default Guest;
