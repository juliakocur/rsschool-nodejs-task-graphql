export interface ICreateProfileArgs {
    dto: {
        isMale: boolean;
        yearOfBirth: number;
        memberTypeId: 'BASIC' | 'BUSINESS';
        userId: string;
    }
}

export interface IChangeUserArgs {
    dto: {
      id: string;
      name?: string;
      balance?: number;
    };
}

export interface ICreatePostArgs {
    dto: {
      title: string;
      content: string;
      authorId: string;
    };
}

export type ProfileTypeSource = {
    id: string;
    isMale: boolean;
    yearOfBirth: number;
    memberTypeId: string;
};

export interface UserSource {
    id: string;
    userSubscribedTo?: {
      id: string;
      name: string;
      balance: number
    }[];
  }

export type Profile = { id: string; userId: string; memberTypeId: string; isMale: boolean; yearOfBirth: number };
export type Post = { id: string; title: string; content: string; authorId: string };
export type MemberType = { id: string; discount: number; postsLimitPerMonth: number };
export type User = { id: string; name: string; balance: number };
  