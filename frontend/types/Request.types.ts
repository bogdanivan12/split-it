export type RequestApiResponse = {
  _id: string;
  group_id: string;
  sender_id: string;
  recipient_id: string;
  date: string;
  type: string;
  status: string;
};

export type RequestsApiResponse = Record<
  string,
  {
    sent: RequestApiResponse[];
    received: RequestApiResponse[];
  }
>;

export class Request {
    
}
