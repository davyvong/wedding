class Response {
  static toJSON(doc) {
    return {
      guest: doc.guest,
      id: doc._id,
    };
  }
}

export default Response;
