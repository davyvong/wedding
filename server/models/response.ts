export interface ResponseData {
  attendance: boolean;
  dietaryRestrictions?: string;
  entree?: string;
  guest: string;
  id: string;
  mailingAddress?: string;
  message: string;
}

export interface ResponseRowData {
  attendance: number;
  dietary_restrictions?: string;
  entree: string;
  guest_id: string;
  mailing_address?: string;
  message: string;
  public_id: string;
}

export interface ResponseSupabaseData {
  attendance: boolean;
  dietary_restrictions?: string;
  entree: string;
  guest_id: string;
  id: string;
  mailing_address?: string;
  message: string;
}

class Response {
  public attendance: boolean;
  public dietaryRestrictions?: string;
  public entree?: string;
  public guest: string;
  public id: string;
  public mailingAddress?: string;
  public message: string;

  constructor(data: ResponseData) {
    this.attendance = data.attendance;
    this.dietaryRestrictions = data.dietaryRestrictions;
    this.entree = data.entree;
    this.guest = data.guest;
    this.id = data.id;
    this.mailingAddress = data.mailingAddress;
    this.message = data.message;
  }

  public static fromRow(row: ResponseRowData): Response {
    const data: ResponseData = {
      attendance: Boolean(row.attendance),
      dietaryRestrictions: row.dietary_restrictions,
      entree: row.entree,
      guest: row.guest_id,
      id: row.public_id,
      mailingAddress: row.mailing_address,
      message: row.message,
    };
    return new Response(data);
  }

  public static fromSupabase(data: ResponseSupabaseData): Response {
    return new Response({
      attendance: data.attendance,
      dietaryRestrictions: data.dietary_restrictions,
      entree: data.entree,
      guest: data.guest_id,
      id: data.id,
      mailingAddress: data.mailing_address,
      message: data.message,
    });
  }

  public valueOf(): ResponseData {
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

export default Response;
