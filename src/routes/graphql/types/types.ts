export interface ICreateUserArgs {
    id: string;
    name: string;
    balance: number;
}
  
export interface IUpdateUserArgs {
    id: string;
    name?: string;
    balance?: number;
}
  
export interface IDeleteUserArgs {
    id: string;
}
  
export interface IUpdatePostArgs {
    id: string;
    title: string;
    content: string;
}
  
export interface IUpdateProfileArgs {
    id: string;
    isMale: boolean;
    yearOfBirth: number,
    memberTypeId: string,
}

export interface ICreatePostArgs {
    id: string;
    title: string;
    content: string;
    authorId: string;
}
  
export interface ICreateProfileArgs {
    id: string;
    isMale: boolean;
    yearOfBirth: number;
    memberTypeId: 'BASIC' | 'BUSINESS';
    userId: string;
}
  