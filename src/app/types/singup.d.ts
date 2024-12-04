export interface SignUpRequestBody {
    email: string;
    name: string;
    password: string;
    phone:string;
    role: "admin" | "user";
}
