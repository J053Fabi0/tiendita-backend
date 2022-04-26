export default interface PersonsDB {
  meta: any;
  name: string; // public name showed in profile
  $loki: number;
  username: string; // unique username to login
  password: string; // hash of password made by JWT
  enabled: boolean;
  role: "admin" | "employee";
}
