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
  