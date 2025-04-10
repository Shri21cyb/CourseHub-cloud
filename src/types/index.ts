export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  price: number;
  imageUrl: string;
  duration: string;
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "user";
}
